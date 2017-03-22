/*------------------------------------------------------------
 // Copyright (C) 2016 正益无线（北京）科技有限公司  版权所有。
 // 文件名：if.js
 // 文件功能描述： 退出练习,封装了该接口
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
    
    var option = {
        method : "POST",
        url :  global.ideuwx + "/iedu/apps/exam/ExmobiExamAction.do?method=outPractice",
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

