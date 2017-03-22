var MEAP = require("meap");
var TopClient = require('topSdk').TopClient;
var async = require("async");

//数据库
var redis = require("meap_redis");
var mongoose = require("mongoose");
var ContactSchema = require("../Contact.js");

var mainSend = false;
//总开关，默认是开
/**1.先从数据库中查找用户的手机号码，
 * 发送短信消息
 * 时间：2016-3-17
 * 作者：xialin
 *
 */
function run(Param, Robot, Request, Response, IF) {

    Response.setHeader("Content-Type", "application/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var msgType = arg.msgType;
    //消息类型
    if (mainSend) {
        //如果开关是开

        if (arg.userList == null || arg.userList == "") {
            Response.end(JSON.stringify({
                "status" : -1,
                "msgStatus" : "E4000501",
                "msg" : "发送用户工号不能为空"
            }));
            return;
        }
        if (msgType == "01") {
            if (arg.content == null || arg.content == "") {
                Response.end(JSON.stringify({
                    "status" : -1,
                    "msgStatus" : "E4000502",
                    "msg" : "发送内容不能为空"
                }));
                return;
            }
        }

        if (arg.userName == null || arg.userName == "") {
            Response.end(JSON.stringify({
                "status" : -1,
                "msgStatus" : "E4000503",
                "msg" : "发送人姓名不能为空"
            }));
            return;
        }
        console.log(1111111111);
        //var mobile = arg.mobile;
        //发送短信内容
        var content = "";

        if (msgType == "01") {
            content = arg.content;
        }

        //发送用户列表
        var userList = arg.userList;

        var newUserList = [];

        //工号转换8103666，转成 08103666
        for (var i = 0; i < userList.length; i++) {
            newUserList.push(new RegExp(userList[i]));
        };

        var userName = arg.userName;
        //查出用户数
        var users = [];

        var client = new TopClient({
            'appkey' : global.sms.appkey,
            'appsecret' : global.sms.appsecret,
            'REST_URL' : global.sms.url
        });

        //默认是消息
        var sendType = "SMS_14211562";
        if (msgType == "01") {
            sendType = "SMS_14211562";
        } else if (msgType == "02") {
            //语音

            sendType = "SMS_14205662";
        } else if (msgType == "03") {
            //表情
            sendType = "SMS_14215560";
        } else if (msgType == "04") {
            //图片
            sendType = "SMS_14206206";

        } else if (msgType == "05") {
            //位置
            sendType = "SMS_14246333";
        }

        async.series([
        function(cb) {
            //从数据中查找
            var conn = mongoose.createConnection(global.mongodbURL);
            var userModel = conn.model("base_user", ContactSchema.BaseUserSchema);
            userModel.find({
                PERNR : {
                    $in : newUserList
                }
            }, {
                ZZ_TEL : -1,
                NACHN : -1
            }).exec(function(err, data1) {

                conn.close();
                if (!err) {

                    console.log("length-------->", data1.length);
                    if (data1.length > 0) {
                        //大于0，则进行发送，否则不发送
                        for (var i in data1) {
                            users.push(data1[i]);
                        }
                        cb(null, "");

                    } else {
                        Response.end(JSON.stringify({
                            "status" : -1,
                            "msgStatus" : "E4000504",
                            "msg" : "查询发送人不存在"
                        }));
                        return;

                    }

                } else {
                    Response.end(JSON.stringify({
                        "status" : -1,
                        "msgStatus" : "E4000505",
                        "msg" : "查询用户数据库失败"
                    }));
                    return;
                }

            });
        },
        function(cb) {
            console.log("send SMS------>");

            var send_message_request = {

                'sms_type' : 'normal',
                'sms_free_sign_name' : '天信',
                'sms_param' : {
                    "name" : userName
                },
                'rec_num' : '',
                'sms_template_code' : sendType

            };

            if (msgType == "01") {
                //文本
                send_message_request['sms_param']['content'] = content;
            }

            async.each(users, function(ele, callback) {
                send_message_request['rec_num'] = ele.ZZ_TEL;

                console.log(send_message_request);

                client.execute('alibaba.aliqin.fc.sms.num.send',send_message_request , function(error, response) { 

                    if (!error) { 

                        console.log(response);

                        var successful = response.result.success;
                        if (successful) {
                            cb(null, "");
                        } else {

                            Response.end(JSON.stringify({
                                "status" : -1,
                                "msgStatus" : "E4000506",
                                "msg" : "发送短信失败"
                            }));
                            return;

                        }

                    } else {
                        console.log(error);
                        Response.end(JSON.stringify({
                            "status" : -1,
                            "msgStatus" : "E4000507",
                            "msg" : "调用阿里大于接口失败"
                        }));
                        return;
                    }

                });

            }, function(err) {
                console.log("结束each ");
                //cb(null, "");
            });

        }], function(err, data) {
            console.log("===========data============" + data);
            if (!err) {
                Response.end(JSON.stringify({
                    "status" : 0,
                    "msgStatus" : "E4000509",
                    "msg" : "发送短信成功"
                }));
            } else {
                Response.end(JSON.stringify({
                    "status" : -1,
                    "msgStatus" : "E4000508",
                    "msg" : "发送短信失败"
                }));

            }

        });

    } else {

        Response.end(JSON.stringify({
            "status" : 0,
            "msgStatus" : "E4000510",
            "msg" : "调用成功"
        }));

    }

}

exports.Runner = run;

