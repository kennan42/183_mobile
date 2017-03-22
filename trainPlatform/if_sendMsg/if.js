var MEAP = require("meap");
var TopClient = require('topSdk').TopClient;
var async = require("async");

var pushURL = "https://api.jpush.cn/v3/push";

/**
 *
 * 功能：发送短信同时推送极光
 * 作者：xialin
 * 时间:20160509
 *
 */
var arg = null;
var mobile = null;
var userId = null;
var msgType = null;
var sendType = 3126;
var teacherList = null;
var isFlag = true;
//判断老师人数是否大于1

function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type", "application/json;charset=utf8");
    arg = JSON.parse(Param.body.toString());

    if (arg.mobile == null || arg.mobile == "") {
        Response.end(JSON.stringify({
            "status" : "-1",

            "msg" : "发送手机号码不能为空"
        }));
        return;
    }

    if (arg.userId == null || arg.userId == "") {
        Response.end(JSON.stringify({
            "status" : "-1",

            "msg" : "发送工号不能为空"
        }));
        return;
    }

    if (arg.msgType == null || arg.msgType == "") {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "消息类型不能为空"
        }));
        return;
    }

    if (arg.teacherList == null || arg.teacherList.length == 0) {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "老师信息不能为空"
        }));
        return;
    }

    sendType = "SMS_14220716";
    //3461

    mobile = arg.mobile;
    userId = arg.userId;
    msgType = arg.msgType;
    teacherList = arg.teacherList;

    console.log(teacherList.length);

    if (teacherList.length > 1) {
        sendType = "SMS_14190599";
        //两人模板
        isFlag = false;
    }

    console.log("========" + userId);

    async.parallel([jpushMsg, sendMsg], function(err, data) {

        if (!err) {
            Response.end(JSON.stringify({
                "status" : "0",
                "msg" : "发送信息成功"
            }));
        } else {
            Response.end(JSON.stringify({
                "status" : "-1",
                "msg" : data
            }));
        }

    });

}

//推送极光
function jpushMsg(callback) {
    var base64_auth_string = new Buffer(global.jpush.appKey + ":" + global.jpush.MasterSecret);
    var base64key = base64_auth_string.toString('base64');

    if (isFlag) {
        var content = "尊敬的" + arg.toName + "先生/女士！根据本年度培训需求调研反馈，您填报的《" + arg.courseName + "》课程即将开班。现将培训通知发送给您，培训时间：" + arg.courseTime + "，培训地点：" + arg.courseAddress + "。如果您有任何疑问请联系培训部" + arg.teacherList[0].teacherName + "老师(" + arg.teacherList[0].teacherPhone + ")。感谢您对培训工作的支持，祝您工作顺利！请点击apps.cttq.com下载安装天信，打开扫一扫即可签到";

    } else {
        var content = "尊敬的" + arg.toName + "先生/女士！根据本年度培训需求调研反馈，您填报的《" + arg.courseName + "》课程即将开班。现将培训通知发送给您，培训时间：" + arg.courseTime + "，培训地点：" + arg.courseAddress + "。如果您有任何疑问请联系培训部" + arg.teacherList[0].teacherName + "老师(" + arg.teacherList[0].teacherPhone + ")或" + arg.teacherList[1].teacherName + "老师(" + arg.teacherList[1].teacherPhone + ")。感谢您对培训工作的支持，祝您工作顺利！请点击apps.cttq.com下载安装天信，打开扫一扫即可签到";

    }

    console.log(arg.userId);
    var sendData = {

        "platform" : "all",

        "audience" : {
            "alias" : [arg.userId],
            "tag" : [arg.msgType]
        },

        "notification" : {

            "android" : {
                "alert" : content,
                "title" : "",
                "builder_id" : 1,
                "extras" : {

                }
            },

            "ios" : {
                "alert" : content,
                "sound" : "default",
                "badge" : "+1",
                "extras" : {

                }
            }
        },

        "message" : {
            "msg_content" : content,
            // "content_type" : "text",
            // "title" : "msg",
            "extras" : {
                "type" : "trainPlatform"
            }
        },

        "options" : {
            "time_to_live" : 86400 * 2,
            "apns_production" : true
        }

    }

    console.log(sendData);

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

        var result = JSON.parse(data);
        console.log(JSON.stringify(result));
        if (result.sendno == 0) {
            callback(err, data);
        } else {
            callback(-1, "推送消息失败");
        }
    });

}

//发送短信
function sendMsg(callback) {

    var client = new TopClient({
        'appkey' : global.sms.appkey,
        'appsecret' : global.sms.appsecret,
        'REST_URL' : global.sms.url
    });

    if (isFlag) {
        var send_message_request = {
            'sms_type' : 'normal',
            'sms_free_sign_name' : '天信',
            'sms_param' : {
                "toName" : arg.toName,
                "courseName" : arg.courseName,
                "courseTime" : arg.courseTime,
                "courseAddress" : arg.courseAddress,
                "teacherName" : arg.teacherList[0].teacherName,
                "teacherPhone" : arg.teacherList[0].teacherPhone

            },
            'rec_num' : mobile,
            'sms_template_code' : sendType

        };

    } else {
        var send_message_request = {
            
             'sms_type' : 'normal',
            'sms_free_sign_name' : '天信',
            'sms_param' : {
                "toName" : arg.toName,
                "courseName" : arg.courseName,
                "courseTime" : arg.courseTime,
                "courseAddress" : arg.courseAddress,
                "teacherName" : arg.teacherList[0].teacherName,
                "teacherPhone" : arg.teacherList[0].teacherPhone,
                "teacherName2" : arg.teacherList[1].teacherName,
                "teacherPhone2" : arg.teacherList[1].teacherPhone

            },
            'rec_num' : mobile,
            'sms_template_code' : sendType

        };

    }
    console.log(send_message_request);
    client.execute('alibaba.aliqin.fc.sms.num.send',send_message_request, function(error, response) {
        console.log("==============");
        console.log(response);
        if (!error) {
            console.log(response.result.successful);
            var successful = response.result.success;
            if (successful) {
                callback(error, "发送成功");
            } else {

                callback(-1, "发送短信失败");

            }

        } else {
            callback(-1, "发送短信失败");
        }

    });

}

exports.Runner = run;
