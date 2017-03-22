var MEAP = require("meap");
var util = require("../../base/util.js");
var jpushUtil = require("../../jpush2/jpush_util.js");
/**
 * 薪资通知消息提醒 传递的参数格式为:year&month&type&userId1,userId2,userId3&userCount
 * @author donghua.wang
 * @date 2015年06月25日 11:12
 * @return string
 * */
function run(Param, Robot, Request, Response, IF) {
	Response.setHeader("Content-type","text/html;charset=utf-8");
    try {
        var arg = Param.body.toString();
        console.log("salaryRemaind --->",arg);
		var arr = arg.split("&");
		var year = arr[0];
		if(year == null || year == ""){
			Response.end("fail");
            return;
		}
        var month = arr[1];
        if (month == null || month == "") {
			Response.end("fail");
            return;
        }
		var type = arr[2];//1工资   2年终奖
		if(type == null || type ==""){
			Response.end("fail");
            return;
		}
        var userIds = arr[3];
        if (userIds == null || userIds == "") {
			Response.end("fail");
            return;
        }
        var userCount = arr[4];
        if (userCount == null || userCount == "") {
			Response.end("fail");
            return;
        }
        var userIdArr = userIds.split(",");
        if(parseInt(userCount) != userIdArr.length){
			Response.end("fail");
            return;
        }        
		var title = "";
		if(type == "1"){
			title = year + "年" + month + "月份的薪资已经发布，赶快登录天信查看明细吧！"
		}
		if(type == "2"){
			title = year + "年的年终奖已经发布，赶快登录天信查看明细吧！";
		}
		Response.end("success");
		var pushArg = {
                "appId" : global.appId,
                "platforms" : "1",
                "title" : title,
                "body" : new Date().getTime() +  "_SalaryRemind",
                "userIds" : userIdArr,
                "module" : "HR_Salary",
                "subModule" : "SalaryRemind"
            };
            
             var jpushArg = {
            userid:"",
            userList:userIdArr,
            title:"",
            content:title,
            type:0,
             msgType:"HR_Salary",
             subModule:"SalaryRemind"
        };     
        
   
    // util.pushMsg(pushArg);   
    jpushUtil.jpush(jpushArg);
            
            
		
    } catch(e) {
		console.log("e-->",e);
		Response.end("fail");
    }
}

exports.Runner = run;

