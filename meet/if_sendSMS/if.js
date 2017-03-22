var MEAP = require("meap");
var TopClient = require('topSdk').TopClient;
var async = require("async"); 
var mongoose = require("mongoose");
var ContactSchema = require("../Contact.js"); 
var util = require("../util.js");
var jpushUtil = require("../../jpush2/jpush_util.js"); 

/**
 * 会议室发送消息提醒（极光推送及短信发送）
 * 先从数据库中查找用户的手机号码，
 * 发送短信消息
 *  与会人员列表userList,会议主题topic,开始时间sTime,结束时间eTime,会议名称name，发送人userid
 * ifsend发送短信，ifjpush推送极光
 * 作者： 
 */
var arg = null;
function run(Param, Robot, Request, Response, IF) {
   
    Response.setHeader("Content-Type", "application/json;charset=utf8");
    arg = JSON.parse(Param.body.toString()); 
    if (arg.userList == null || arg.userList.length == 0) {
        Response.end(JSON.stringify({
            "status" : "-1", 
            "msg" : "接受人信息不能为空"
        }));
        return;
    }
    if (arg.topic == null || arg.topic == "") {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "会议主题不能为空"
        }));
        return;
    }
    if (arg.name == null || arg.name == "") {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "会议名称不能为空"
        }));
        return;
    }
    if (arg.userid == null || arg.userid == "") {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "发送工号不能为空"
        }));
        return;
    } 
    if (arg.sTime == null || arg.sTime == "") {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "发送开始时间不能为空"
        }));
        return;
    }
    if (arg.eTime == null || arg.eTime == "") {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "发送结束时间不能为空"
        }));
        return;
    } 
    
    async.parallel([sendmsg, sendSMS], function(err, data) { 
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
/**
 * 短发发送
 * 入参:userList接收方人员集合，topic会议主题，sTime开始时间，eTime结束时间，name会议名称
 */
function sendSMS(cb){  
    //消息类型
    if (arg.ifsend==1) {
        //如果开关是开  
        console.log(1111111111);  
        //发送用户列表 
        var newUserList = []; 
        //工号转换8103666，转成 08103666
        for (var i = 0; i < arg.userList.length; i++) {
            newUserList.push(new RegExp(arg.userList[i].userId));
        }; 
        //查出用户数
        var users = []; 
        var client = new TopClient({
            'appkey' : global.sms.appkey,
            'appsecret' : global.sms.appsecret,
            'REST_URL' : global.sms.url
        }); 
        //默认是消息
        var sendType = "SMS_18175184"; 
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
                        console.log("查询到的结果："+data1);
                        for (var i in data1) {
                            users.push(data1[i]);
                        }
                        cb(null, ""); 
                    } else { 
                        cb(-1,"查询发送人不存在"); 
                    } 
                } else { 
                   cb(-1,"查询用户数据库失败");
                } 
            });
        },
        function(cb) {
            console.log("send SMS------>"); 
            var send_message_request = { 
                'sms_type' : 'normal',
                'sms_free_sign_name' : '天信',
                'sms_param' : {
                     "topic":arg.topic,
                     "sTime":arg.sTime,
                     "eTime":arg.eTime,
                     "name":arg.name
                },
                'rec_num' : '',
                'sms_template_code' : sendType

            }; 
            async.each(users, function(ele, callback) {
                send_message_request['rec_num'] = ele.ZZ_TEL; 
              //临时设置电话号码：
              //send_message_request['rec_num']="15905166980";
                console.log(send_message_request); 
                client.execute('alibaba.aliqin.fc.sms.num.send',send_message_request , function(error, response) { 
                    if (!error) {  
                        console.log(response); 
                        var successful = response.result.success;
                        if (successful) {
                            cb(null, "大于短信发送成功");
                        } else { 
                           cb(-1,"发送短信失败");
                        } 
                    } else { 
                       cb(-1,"调用阿里大于接口失败");
                    } 
                }); 
            }, function(err) {
                console.log("结束each ");
                //cb(null, "");
            }); 
        }], function(err, data) { 
            if (!err) { 
               cb(0,"发送短信成功");
            } else { 
               cb(-1,"发送短信失败");
            } 
        }); 
    } else { 
       cb(0,"调用成功");
    } 
}

/*
 * 极光推送
 * 入参：发送人，接受人（可多个），会议时间，会议地点
 */
function sendmsg(cb){ 
    if(arg.ifjpush==1){
           if (arg.userList != null && arg.userList.length > 0) { 
        var userIds = [];
        for (var i in arg.userList) {
            var userId = arg.userList[i].userId;
            userIds.push(userId);
        } 
        var jpushArg = {
            userid : arg.userid,
            userList : userIds,
            title : "", 
            content : "您好，会议 " + arg.topic+" 将于 "+ arg.sTime + " 至 "+ arg.eTime+"在 "+ arg.name +" 举行，请您准时参加。",
            type : 0,
            msgType : "MeetingRoomBooking",
            subModule : "MeetingRoomApply"
        }; 
       jpushUtil.jpush(jpushArg);
       cb("","推送成功");
    } 
    }else{
         cb(0,"调用成功");
    } 
}
 
exports.Runner = run;

