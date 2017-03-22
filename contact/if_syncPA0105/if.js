var MEAP = require("meap");
var redis = require("meap_redis");
var mongoose = require("mongoose");
var h2p = require("hanzi_to_pinyin");
var ContactSchema = require("../Contact.js");
var util = require("../../base/util.js");
var path = require("path");
var async = require("async");
var contactUtil = require("../util.js");

var updateTime = 60 * 60 * 1000;

/**
 *
 * 同步PA0105 手机号码RTX，邮箱增量或全量 更新，PRD分别在145，150上启动同步程序
 *  如果145已经同步成功，则150上不再进行数据同步
 * 1 判断今天是否已经进行了数据同步（syncPA0105:2008-08-08）
 * 2 调用webservice查询学历专业学校
 * 3 如果查询到数据，则删除旧数据，插入新数据
 * 4 设置redis
 * @author xialin
 * @date 2016年3月7日 15:56
 *
 *
 */

function run(Param, Robot, Request, Response, IF) {
    console.log("sync PA0105---->");
    //简单的请求验证

    var headers = Request.headers;
    var host = headers.host;

    console.log(host);
    if (host.indexOf("localhost") == -1) {
        console.log("auth failed");
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "请求IP错误"
        }));
        return;
    }
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

    async.series([
    //判断是否需要更新
    function(cb) {
        var redisCli = redis.createClient(global.redisPort, global.redisHost);
        redisCli.on("ready", function() {
            redisCli.select(contactUtil.contactConst.redisDB, function() {
                redisCli.get("syncPA0041", function(err, data) {
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
            "wsdl" : path.join(__dirname.replace(IF.name, ""), global.wsdl, "zhrtxws07.xml"),
            "func" : "ZHRTXWS07.ZHRTXWS07.ZHRTXWS07",
            "Params" : reqParam,
            "agent" : false
        };
        MEAP.SOAP.Runner(option, function(err, res, data1) {
            console.log("-------async  2");
            if (!err && data1.ES_PUBLIC.TYPE == 0 && data1.ET_PA0105.item != null) {
                var rs = data1.ET_PA0105.item;
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

                    //通讯类型 有CELL，0001，RTX
                    //0010：邮箱 USRID_LONG
                    //RTX:  USRID
                    //CELL:USRID

                    if (user.USRTY == "CELL") {
                        //更新号码
                        var cell = user.USRID;
                        //后4位

                        var ZZ_TEL_SUF = cell.substr(cell.length - 4, 4);
                        userModel.update({
                            "PERNR" : userId
                        }, {
                            $set : {

                                "ZZ_TEL" : cell, //更新手机号码
                                "ZZ_TEL_SUF" : ZZ_TEL_SUF, //更新后四位
                                "syncTime" : new Date().getTime(),
                                "syncTime2" : currentDate
                            }

                        }, {
                            "upsert" : true
                        }, function(err) {
                            callback(null, "");
                        });

                    } else if (user.USRTY == "RTX") {
                        //更新RTX
                         userModel.update({
                            "PERNR" : userId
                        }, {
                            $set : {

                                "ZZ_RTX" : user.USRID, //更新RTX
                                "syncTime" : new Date().getTime(),
                                "syncTime2" : currentDate
                            }

                        }, {
                            "upsert" : true
                        }, function(err) {
                            callback(null, "");
                        });
                        
                        

                    } else if (user.USRTY == "0010") {
                        //更新邮箱
                        
                          userModel.update({
                            "PERNR" : userId
                        }, {
                            $set : {

                                "ZZ_EMAIL" : user.USRID_LONG, //更新邮箱 
                                "syncTime" : new Date().getTime(),
                                "syncTime2" : currentDate
                            }

                        }, {
                            "upsert" : true
                        }, function(err) {
                            callback(null, "");
                        });
                        
                    }

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
                redisCli.set("syncPA0105", currentDate, function(err) {
                    redisCli.quit();
                    cb(null, "");
                });
            });
        });
    }], function(err, data) {
        Response.end("sync PA0105 over");
        console.log("sync PA0105 over");
    });
}

exports.Runner = run;

