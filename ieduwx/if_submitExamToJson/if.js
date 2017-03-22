/*------------------------------------------------------------
 // Copyright (C) 2016 正益无线（北京）科技有限公司  版权所有。
 // 文件名：if.js
 // 文件功能描述： 提交试卷,封装了该接口
 //
 // 创 建 人：杨尚飞
 // 创建日期：2015.1.21
 //
 // 修 改 人：
 // 修改日期：
 // 修改描述：
 //-----------------------------------------------------------*/

var MEAP = require("meap");

function run(Param, Robot, Request, Response, IF) {
    
     var body ={};
    if (Param.body != null) {
        body = JSON.parse(Param.body.toString());
    }
     //为了解决传值给考试接口无法识别多值数组的问题，把数组拼接成单值数组
    var groups = body.data.group;
	console.log("-------------------start--------------------------------GROPUP："+groups.length);
	if(groups.length>0){
	 var newgroups =[];
     var str = "";
    for(var i in groups){
        str+=groups[i];
    }
    newgroups.push(str);
    body.data.group =newgroups; 	
	}
   
	console.log("---------------------------------------------------GROPUP："+ body.group);
    var option = {
        method : "POST",
        url : global.ideuwx + "/iedu/apps/exam/ExmobiExamAction.do?method=submitExamToJson",
        Cookie : "true",
        Enctype:"application/x-www-form-urlencoded",
        Body : body.data,
       Headers :  {
            //cookie:Request.headers.cookie
			cookie:body.cookie
            }
    };

    MEAP.AJAX.Runner(option, function(err, res, data) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err) {
            Response.end(data);
        } else {
            Response.end(JSON.stringify({
                status : '1',
                message : JSON.stringify(err)
            }));
        }
    }, Robot);
}

exports.Runner = run;

