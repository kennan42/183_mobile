var MEAP=require("meap");
var mongoose = require("mongoose");
var async = require("async");
var easemobService = require("../_service/easemobService.js");
var sendSmsToInactiveService = require("../_service/sendSmsToInactiveService.js");
var common = require("../../analy/common.js");

function run(Param, Robot, Request, Response, IF)
{
    var timeStampLog = {};
    
    timeStampLog.requestDate = common.date2str(new Date(), "yyyy-MM-dd hh:mm:ss");//接口访问日期
    timeStampLog.requestTime = Date.now();//接口访问时刻
    timeStampLog.arg = Param.body.toString();//接口访问参数
    Response.setHeader("Content-Type", "application/json;charset=utf8");
    console.log("sendSmsToInactiveUsers start");
    var arg = JSON.parse(Param.body.toString());
    var fromUserId = arg.fromUserId;
    var fromUserName = arg.fromUserName;
    var toId = arg.toId;
    var toIdType = arg.toIdType;//groupId或者userId
    var contentType = arg.contentType;
    var content = arg.content;
    if(!fromUserId || !fromUserName || !toId || !toIdType || !contentType ){
        Response.end(JSON.stringify({status:-1 , msg:"your miss some params."}));
    }else{
        Response.end(JSON.stringify({status:0,msg:"success."}));
        async.waterfall([
            //读取短信开关
            function(cb){
                if(toIdType=="groupId"){
                    //console.log("getGroupChatFlag");
                    sendSmsToInactiveService.getGroupChatFlag(cb);
                }else{
                    //console.log("getSingleChatFlag");
                    sendSmsToInactiveService.getSingleChatFlag(cb);
                }
            },
            //获取群成员
            function(chatFlag, cb){
                //读取短信开关
                console.log(chatFlag);
                if(chatFlag===0) {
                    console.log({err:-1,msg:"短信开关关闭"});
                    return cb(-1,"chatFlag closed.");
                }
                if(toIdType=="groupId"){
                    //获取群组成员
                    var groupId = toId;
                    timeStampLog.invokeEasemobTime = Date.now();//开始访问环信的时刻
                    easemobService.getChatGroup(groupId,function(err,members){
                    timeStampLog.completeEasemobTime = Date.now();//结束访问环信的时刻
                        cb(err,members);
                    });
                }else{
                    cb(null,[userId]);
                }                
            },
            //获取非活跃用户
            function(members,cb){
                var body = {userIds:members};
                //body = JSON.stringify(body);
                var option={
                    method : "POST",
                    url : global.baseURL+"/qx/getInactiveUsers",
                    Cookie : "true",
                    timeout : 60,
                    Body:body,
                    Enctype:"application/json",
                    agent : "false",
                    FileRNLength : "false",
                };
                console.log(option);
                MEAP.AJAX.Runner(option,function(err,res,data){
                    console.log(data);
                    if(!err){
                        data = JSON.parse(data);
                        if(!data.status){
                            cb(null,data.inactiveUsers);
                        }else{
                            cb(-1,"getInactiveUsers failed.");
                        }
                    }else{
                        cb(-1,"can not access interface: /qx/getInactiveUsers");
                    } 
                });
            },
            //发送短信
            function(inactiveUsers,cb){
                console.log("inactiveUsers:"+ inactiveUsers);
                var body = {
                    userName:fromUserName,
                    userList:inactiveUsers,
                    msgType:contentType
                };
                if(content)   body.content = content;
                var option={
                    method : "POST",
                    url : global.baseURL+"/pushSMS/pushMsg",
                    Cookie : "true",
                    timeout : 60,
                    Body:body,
                    Enctype:"application/json",
                    agent : "false",
                    FileRNLength : "false",
                };
                
                console.log(option);
                timeStampLog.sendSmsTime = Date.now();//开始发送短信的时刻
                timeStampLog.sendSmsOption = JSON.stringify(option);//调用短信发送接口的参数
                MEAP.AJAX.Runner(option,function(err,res,data){
                    timeStampLog.completeSendSmsTime = Date.now();//短信发送结束的时刻
                    if(!err){
                        timeStampLog.sendSmsResult = data;//记录短信发送接口的返回结果
                        data = JSON.parse(data);
                        if(data.status){
                            console.log("短信发送失败");
                            cb(null,timeStampLog);
                        }else{
                            cb(null,timeStampLog);
                        } 
                    }else{
                        timeStampLog.sendSmsResult = "can not access interface:/pushSMS/pushMsg";//记录短信发送接口的返回结果
                        cb(null,"can not access interface:/pushSMS/pushMsg");
                    }
                });
            },
            //保存时间日志记录
            function(timeStampLog,cb){
                timeStampLog.requestCostTime = timeStampLog.invokeEasemobTime-timeStampLog.invokeEasemobTime;
                timeStampLog.invokeEasemobCostTime = timeStampLog.completeEasemobTime -timeStampLog.invokeEasemobTime;
                timeStampLog.handleDataCostTime = timeStampLog.sendSmsTime-timeStampLog.completeEasemobTime;
                timeStampLog.sendSmsCostTime = timeStampLog.completeSendSmsTime - timeStampLog.sendSmsTime;
                sendSmsToInactiveService.saveLog(timeStampLog,function(err,msg){
                    cb(err,msg);
                });
            }            
           
        ],function(err,msg){
            if(err)
                console.log({err:err,msg:msg});
            console.log("send sms to inactive users end.");
        });
        

    }
}

exports.Runner = run;
