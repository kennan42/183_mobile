/**
 * @todo        查询代办总数，进行推送
 * @author      ken
 * @since       2015-10-20
 *
 */

var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var baseSchema = require("./BaseSchema.js");
var async = require("async");

var appKey = "868c28217f56268a58b72e62";
var MasterSecret = "189289c71ec7ff4bc8fbafc8";
var base64key = "ODY4YzI4MjE3ZjU2MjY4YTU4YjcyZTYyOjE4OTI4OWM3MWVjN2ZmNGJjOGZiYWZjOA==";
var pushURL = "https://api.jpush.cn/v3/push";

var arg =null;  //传入arg
var util = {

    pushMsg : function(pushArg) {
        arg =pushArg;
        var num = 0;
        async.parallel([findA, findB, findC, findD], function(err, data) {

            //推送
            num = data[0] + data[1] + data[2] + data[3];

            // arg.message.extras.number = num;

            var sendData = {

                "platform" : "all",

                "audience" : {
                    "alias" : [arg.userCodeListStr]
                },

                "notification" : {

                    "android" : {
                        "alert" : arg.title,
                        //"title" : title,
                        "builder_id" : 1,
                        "extras" : {

                        }
                    },

                    "ios" : {
                        "alert" : arg.title,
                        "sound" : "default",
                        "badge" : "+1",
                        "extras" : {

                        }
                    }
                },

                "message" : {
                    "msg_content" : "这是推送消息",
                    "content_type" : "text",
                    "title" : "msg",
                    "extras" : {
                        "number" : num
                    }
                },

                "options" : {
                    "time_to_live" : 60,
                    "apns_production" : true
                }

            }

            /*
            if (arg.title.length > 40) {
            var subTitle = arg.title.substr(0, 40) + "...";
            arg.title = subTitle;
            }*/

            // cosole.log(arg);

            var option = {
                method : "POST",
                url : pushURL,
                Cookie : "true",
                Headers : {
                    "Content-Type" : "application/json",
                    "Authorization" : "Basic " + base64key

                },
                Body : sendData
            };

            MEAP.AJAX.Runner(option, function(err, res, data) {

                var pushResult = JSON.parse(data);
                console.log(pushResult);

                if (pushResult.sendno == 0) {
                    //发送成功
                    console.log("send ok");
                }
            }, null);

        });
    }
}


//ZHRWS_GET_OT_CO_LINES
function findA(callback) {

    var paramJSon = {
        "IS_PUBLIC" : {
            "FLOWNO" : "",
            "PERNR" : "",
            "ZDOMAIN" : "400"
        },
        "P_SP_PERNR" : arg.userCodeListStr,
        "P_SP_STATUS" : 0
    };
    var option = {
        // agent : false,
        method : "POST",
        url : global.baseURL + "/zhrws/ZHRWS_GET_OT_CO_LINES",
        Body : paramJSon
    };

    MEAP.AJAX.Runner(option, function(err, res, data) {
        if (!err) {
            data = JSON.parse(data);
            var num1 = data.E_2005;
            var num2 = data.E_2011;

            callback(err, parseInt(num1) + parseInt(num2));
        } else {
            callback(err, 0);
        }

    });

}

function findB(callback) {
    var paramJSon = {
        "input" : {
            "channelSerialNo" : new Date().getTime(), //序列号
            "currUsrId" : arg.userCodeListStr, //员工号
            "domain" : "400",
            "extendMap" : {
                "entry" : [{
                    "Key" : "",
                    "Value" : ""
                }]
            },
            "qryType" : "4",
            "userId" : arg.userCodeListStr,
            "lastTime" : "", //获取当天日期
            "bussType" : "2001", //代表休假待审列表
            "startPage" : 1,
            "pageSize" : 1000
        }
    };

    var option = {
        // agent : false,
        method : "POST",
        url : global.baseURL + "/portal/PORTAL_BPMI_TaskListQry",
        Body : paramJSon
    };
    MEAP.AJAX.Runner(option, function(err, res, data) {
        if (!err) {
            data = JSON.parse(data);
            if (data.output.type == "S") {

                callback(err, parseInt(data.output.totalCount));
            } else {
                callback(err, 0);
            }
        } else {
            callback(err, 0);
        }
    });

}

//查询会议室的带审批的数量
function findC(cb) {
    var option = {
        //  agent : false,
        url : global.baseURL + "/meet/examine",
        method : "post",
        Body : {
            "state" : "0",
            "pageNumber" : 1,
            "pageSize" : 1,
            "userId" : arg.userCodeListStr
        }
    };
    MEAP.AJAX.Runner(option, function(err, res, data) {
        if (!err) {
            var data = JSON.parse(data);

            cb(null, data.count);

        } else {
            cb(null, 0);
        }
    });
}

//查看文档平台的代办的数量
function findD(cb) {
    var option = {
        //  agent : false,
        url : global.baseURL + "/docPlatform/PORTALBPMIWaitTaskNumImplBean",
        method : "post",
        Body : {
            "input" : {
                "channelSerialNo" : new Date().getTime(), // 时间戳 + 123456789
                "currUsrId" : arg.userCodeListStr,
                "domain" : 400,
                "reqUsrId" : arg.userCodeListStr
            }
        }
    };
    MEAP.AJAX.Runner(option, function(err, res, data) {
        if (!err) {
            data = JSON.parse(data);
            var num1 = parseInt(data.output.fmsSaveWTNum) + parseInt(data.output.fmsReadWTNum) + parseInt(data.output.fmsDestWTNum);

            cb(null, num1);
        } else {
            cb(null, 0);
        }
    });
}

////根据时间戳得到时间格式MM-dd HH:mm
function getMMddHHmmFromTimes(times) {
    var date = new Date();
    date.setTime(times);
    var month = date.getMonth() + 1 + "";
    var curDate = date.getDate() + "";
    var hour = date.getHours() + 100 + "";
    var minute = date.getMinutes() + 100 + "";
    return month + "月" + curDate + "日 " + hour.substr(-2) + ":" + minute.substr(-2);
}

//保存推送消息记录
function savePushMsgLog(arg) {
    var db = mongoose.createConnection(global.mongodbURL);
    var basePushMessageLogModel = db.model("basePushMessageLog", baseSchema.BasePushMessageLogSchema);
    var basePushMessageLogEntity = new basePushMessageLogModel({
        appId : arg.appId,
        userId : arg.userCodeListStr,
        title : arg.title,
        body : arg.body,
        pushTime : new Date().getTime(),
        readStatus : 0,
        module : arg.module,
        subModule : arg.subModule
    });
    basePushMessageLogEntity.save(function(err) {
        db.close();
    });
}

exports.pushMsg = util.pushMsg;
exports.savePushMsgLog = savePushMsgLog;

exports.getMMddHHmmFromTimes = getMMddHHmmFromTimes; 