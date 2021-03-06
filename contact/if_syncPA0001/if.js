var MEAP = require("meap");
var redis = require("meap_redis");
var mongoose = require("mongoose");
var h2p = require("hanzi_to_pinyin");
var ContactSchema = require("../Contact.js");
var util = require("../../base/util.js");
var path = require("path");
var async = require("async");
var contactUtil = require("../util.js");

/**
 *
 * 同步PA0001 组织架构信息增量或全量 更新，PRD分别在145，150上启动同步程序
 *  如果145已经同步成功，则150上不再进行数据同步
 * 1 判断今天是否已经进行了数据同步（syncOrg:2008-08-08）
 * 2 调用webservice查询组织机构数据
 * 3 如果查询到数据，则删除旧数据，插入新数据
 * 4 设置redis，表示今天已经进行了组织机构的同步（syncOrg:2008-08-08）
 * @author xialin
 * @date 2016年3月3日 15:56
 *
 *
 */

//设置1小时更新一次
var updateTime = 60 * 60 * 1000;

function run(Param, Robot, Request, Response, IF) {
    console.log("sync PA0001---->");
    //简单的请求验证

    var headers = Request.headers;
    var host = headers.host;

    console.log(host);
   /* if (host.indexOf("localhost") == -1) {
        console.log("auth failed");
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "请求IP错误"
        }));
        return;
    }*/
    var udpateAll = false;
    //是否全量更新,X 表示增量更新，""表示全量，如果
    /*
     * 2、   IM_KEYDATE：传入日期（8位数日期如：20151001），用于确认增量数据的日期区间
     3、  IM_ADDDATA：增量更新标识，不传值表示获取全量数据，传值表示为获取增量数据
     补充说明：在IM_ADDDATA传值，传入日期IM_KEYDATE不传值时，默认取得当前日期前2天至今的增量数据，建议传入日期为当前日期前2天

     */
    var users = [];
    //调用webservice返回的员工信息
    var currentDate = util.getDateStrFromTimes(new Date().getTime(), true);
    //2016-03-14 11:42:26，这里更新 只能具体到某一天
    var nowTime = new Date(currentDate).getTime() - updateTime;
    //转为时间戳

    async.series([
    //判断是否需要更新
    function(cb) {
        var redisCli = redis.createClient(global.redisPort, global.redisHost);
        redisCli.on("ready", function() {
            redisCli.select(contactUtil.contactConst.redisDB, function() {
                redisCli.get("syncPA0001", function(err, data) {
                    redisCli.quit();
                    if (data == null) {//全量更新
                        udpateAll = true;
                        cb(null, "");
                    } else {
                       
                        if (nowTime >= new Date(data).getTime()) {

                            cb(null, "");
                        } else {
                            Response.end("has synced on the first server");
                            console.log("has synced on the first server");
                        }
                    }
                });
            });
        });
    },
    //调用webservice接口同步用户信息

    function(cb) {
        var reqParam = {

            "IS_PUBLIC" : {
                "FLOWNO" : "",
                "PERNR" : "",
                "ZDOMAIN" : "",
                "I_PAGENO" : "",
                "I_PAGESIZE" : ""
            },
            "IM_ADDDATA" : "",
            "IM_KEYDATE" : "",
            "IM_KEYTIME" : ""
        };
        if (!udpateAll) {
            //增量更新
            //默认取得前两天的值
            // reqParam.KEYDATE = "";
            reqParam.IM_ADDDATA = "X";
        }
        var option = {
            "wsdl" : path.join(__dirname.replace(IF.name, ""), global.wsdl, "zhrtxws04.xml"),
            "func" : "ZHRTXWS04.ZHRTXWS04.ZHRTXWS04",
            "Params" : reqParam,
            "agent" : false
        };
        MEAP.SOAP.Runner(option, function(err, res, data1) {
            console.log("-------async  2");
            if (!err && data1.ES_PUBLIC.TYPE == 0 && data1.ET_PA0001.item != null) {
                var rs = data1.ET_PA0001.item;
                console.log("2-------->", rs.length);
                for (var i in rs) {
                    users.push(rs[i]);
                }
            }
            cb(null, "");
        });
    },

    //更新用户数据
    function(cb) {
        console.log("start upadte user info");
        if (users.length > 0) {
            var conn = mongoose.createConnection(global.mongodbURL);
            var userModel = conn.model("base_user", ContactSchema.BaseUserSchema);
           
            var userQueue = async.queue(function(task, callback) {
                setTimeout(function() {
                    var user = task;
                    var telSuf = "";
                    var userId = user.PERNR;

                    userModel.update({
                        "PERNR" : userId
                    }, {
                      
                            "PLANS" : user.PLANS,
                            "BUKRS" : user.BUKRS,
                            "BUTXT" : user.BUTXT,
                            "ZZ_JG1" : user.ZZ_JG1,
                            "ZZ_JG2" : user.ZZ_JG2,
                            "ZZ_JG3" : user.ZZ_JG3,
                            "ZZ_JG4" : user.ZZ_JG4,
                            "ZZ_JG5" : user.ZZ_JG5,
                            "ORGEH" : user.ORGEH,
                            "ORGTX" : user.ORGTX,
                            "PLSTX" : user.PLSTX,
                            "STELL" : user.STELL,
                            "STLTX" : user.STLTX,
                            "WERKS" : user.WERKS,
                            "PBTXT" : user.PBTXT,
                            "BTRTL" : user.BTRTL,
                            "BTRTX" : user.BTRTX,
                            "PERSG" : user.PERSG,
                            "PGTXT" : user.PGTXT,
                            "PERSK" : user.PERSK,
                            "PKTXT" : user.PKTXT,

                            "syncTime" : new Date().getTime(),
                            "syncTime2" : currentDate
                        

                    }, {
                        "upsert" : true
                    }, function(err) {
                        callback(null, "");
                    });
                }, 5000);
            }, 100);
            for (var i in users) {
                userQueue.push(users[i], function(err, data) {
                });
            }
            userQueue.drain = function() {
                conn.close();
                cb(null, "");
            }
        } else {
            cb(null, "");
        }

    },
    //设置用户同步标识
    function(cb) {
        var redisCli = redis.createClient(global.redisPort, global.redisHost);
        redisCli.on("ready", function() {
            redisCli.select(contactUtil.contactConst.redisDB, function() {
                redisCli.set("syncPA0001", currentDate, function(err) {
                    redisCli.quit();
                    cb(null, "");
                });
            });
        });
    }], function(err, data) {
        Response.end("sync PA0001 over");
        console.log("sync PA0001 over");
    });
}

exports.Runner = run;

