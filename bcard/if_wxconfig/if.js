var MEAP = require("meap");
var jsSHA = require('jssha');
var REDIS = require("meap_redis");

var redisCli = null;
function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type", "text/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
	var url = arg.url;
    if (!(url)) {
        Response.end(JSON.stringify({
            status: 1,
            msg: "参数错误"
        }));
        return;
    }

    var appID = global.appID;
    var appsecret = global.appsecret;

    redisCli = REDIS.createClient(global.redisPort, global.redisHost);
    redisCli.on("ready", function () {  // 准备
        redisCli.select(10, function () {  // 选择10号库
            getAccessToken(Robot, Response, appID, appsecret, function (accessToken) {
                getJsapiTicket(Robot, accessToken, function (ticket) {
                    redisCli.quit();

                    var sign = createSignature(ticket, url);
                    var result = {
                        appId: appID,
                        timestamp: sign.timestamp,
                        nonceStr: sign.nonceStr,
                        signature: sign.signature
                    };

                    Response.end(JSON.stringify({
                        status: 0,
                        data: result
                    }));
                })
            });
        });
    });
}

/**
 * 从Redis中获取微信access_token
 *
 * @param Robot
 * @param Response
 * @param appID
 * @param appsecret
 * @param cb(data) data:{string}
 */
function getAccessToken(Robot, Response, appID, appsecret, cb) {
    redisCli.get('wx_access_token', function (err, data) {  // 获取是否被锁
        if (err || data == null || data == 'null') {
            getNewAccessToken(Robot, appID, appsecret, function (err, data) {
                if (err) {
                    errEnd(Response, redisCli, 'access_token get error');
                    return;
                }

                var accessToken = data.accessToken;
                setAccessToken(accessToken, data.expiresIn, function (err) {
                    if (err) {
                        errEnd(Response, redisCli, 'access_token save error');
                        return;
                    }
                    cb(accessToken);
                });
            });
        } else {
            cb(data);
        }
    });
}

/**
 * 将微信access_token保存到Redis
 *
 * @param accessToken
 * @param ttl
 * @param cb(err)
 */
function setAccessToken(accessToken, ttl, cb) {
    redisCli.SETEX('wx_access_token', ttl, accessToken, function (err) {
        cb(err);
    });
}

/**
 * 从Redis中获取微信ticket
 *
 * @param Robot
 * @param accessToken
 * @param cb(data) data:{string}
 */
function getJsapiTicket(Robot, accessToken, cb) {
    redisCli.get('wx_ticket', function (err, data) {  // 获取是否被锁
        if (err || data == null || data == 'null') {
            getNewJsapiTicket(Robot, accessToken, function (err, data) {
                if (err) {
                    errEnd(Response, redisCli, 'ticket get error');
                    return;
                }

                var ticket = data.ticket;
                setJsapiTicket(ticket, data.expiresIn, function (err) {
                    if (err) {
                        errEnd(Response, redisCli, 'ticket save error');
                        return;
                    }
                    cb(ticket);
                });
            });
        } else {
            cb(data);
        }
    });
}

/**
 * 将微信ticket保存到Redis
 *
 * @param ticket
 * @param ttl
 * @param cb(err)
 */
function setJsapiTicket(ticket, ttl, cb) {
    redisCli.SETEX('wx_ticket', ttl, ticket, function (err) {
        cb(err);
    });
}

/**
 * 获取 access_token
 *
 * 参考 https://mp.weixin.qq.com/wiki/15/54ce45d8d30b6bf6758f68d2e95bc627.html
 *
 * @param Robot
 * @param appID
 * @param appsecret
 * @param cb (err, data)  data:{accessToken: string, expiresIn: Number}
 */
function getNewAccessToken(Robot, appID, appsecret, cb) {
    var option = {
        method: "GET",
        url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appID + '&secret=' + appsecret
    };

    MEAP.AJAX.Runner(option, function (err, res, data) {
        if (err != null || data == null || data == 'null') {
            cb(err, {});
            return
        }
        data = JSON.parse(data);
        if (!(data.access_token && data.expires_in)) {
            cb(err, {});
            return
        }
        cb(null, {
            accessToken: data.access_token,
            expiresIn: data.expires_in
        });
    }, Robot);
}

/**
 * 获取jsapi_ticket
 *
 * @param Robot
 * @param accessToken
 * @param cb (err, data)  data:{ticket: string, expiresIn: Number}
 */
function getNewJsapiTicket(Robot, accessToken, cb) {
    var option = {
        method: "GET",
        url: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + accessToken + '&type=jsapi'
    };

    MEAP.AJAX.Runner(option, function (err, res, data) {
        if (err != null || data == null || data == 'null') {
            cb(err, {});
            return
        }
        data = JSON.parse(data);
        if (!(data.errcode == 0 && data.ticket && data.expires_in)) {
            cb(err, {});
            return
        }
        cb(null, {
            ticket: data.ticket,
            expiresIn: data.expires_in
        });
    }, Robot);
}

/**
 * 创建随机nonceStr
 *
 * @returns {string}
 */
function createNonceStr() {
    return Math.random().toString(36).substr(2, 15);
}

/**
 * 获取当前时间戳
 *
 * @returns {string}
 */
function createTimestamp() {
    return parseInt(new Date().getTime() / 1000) + '';
}

/**
 * 对所有待签名参数按照字段名的ASCII 码从小到大排序（字典序）后，使用URL键值对的格式（即key1=value1&key2=value2…）拼接成字符串
 *
 * @param args {{jsapi_ticket: string, nonceStr: string, timestamp: Number, url: string}}
 * @returns {string}
 */
function raw(args) {
    var keys = Object.keys(args);
    keys = keys.sort();
    var newArgs = {};
    keys.forEach(function (key) {
        newArgs[key.toLowerCase()] = args[key];
    });

    var string = '';
    for (var k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
}

/**
 * @synopsis 签名算法
 *
 * @param jsapi_ticket 用于签名的 jsapi_ticket
 * @param url 用于签名的 url ，注意必须动态获取，不能 hardcode
 *
 * @returns {{jsapi_ticket: string, nonceStr: string, timestamp: Number, url: string, signature: string}}
 */
function createSignature(jsapi_ticket, url) {
    var ret = {
        jsapi_ticket: jsapi_ticket,
        nonceStr: createNonceStr(),
        timestamp: createTimestamp(),
        url: url
    };

    var string = raw(ret);
    var shaObj = new jsSHA(string, 'TEXT');
    ret.signature = shaObj.getHash('SHA-1', 'HEX');

    return ret;
}

function errEnd(Response, redisCli, msg) {
    Response.end(JSON.stringify({
        status: 1,
        msg: msg
    }));
    redisCli.quit();
}

exports.Runner = run;