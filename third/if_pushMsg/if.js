var MEAP=require("meap");
var util = require("../../base/util.js");
var jpushUtil = require("../../jpush2/jpush_util.js");


function run(Param, Robot, Request, Response, IF)
{
    var arg = JSON.parse(Param.body.toString());
    console.log("======third jpush =====");
	 var pushArg = {
            appId : global.appId,
            platforms : "0,1",
            title:arg.title,
            userIds:arg.userIds,
            body : new Date().getTime()  + "_" +  arg.subModule,    
            module:arg.module,
            subModule:arg.subModule
        }; 
        
     var jpushArg = {
            userid:"",
            userList:arg.userIds,
            title:"",
            content:arg.title,
            type:0,
             msgType:arg.module,
             subModule:arg.subModule
        };     
        
   
	// util.pushMsg(pushArg);	
	jpushUtil.jpush(jpushArg);
	
	
     Response.end(JSON.stringify({
            "status":"0",
            "msg":"调用消息推送成功"
        }));
    
}

exports.Runner = run;


                                

	

