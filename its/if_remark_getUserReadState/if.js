/*------------------------------------------------------------
 // Copyright (C) ken
 // 文件名：if.js
 // 文件功能描述： 获取用户提示小红点
 //
 // 创 建 人：xialin
 // 创建日期：2016.11.07
 //
 // 修 改 人：
 // 修改日期：
 // 修改描述：
 //-----------------------------------------------------------*/
var MEAP = require("meap");

function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-type", "text/json;charset=utf-8");
    var option = {
        method: "POST",
        url: global.its + "/its-gwy/remark/getUserReadState",
        Cookie: "true",
        agent: "false",
        Enctype: "application/json",
        Body: Param.body.toString()
    };

    MEAP.AJAX.Runner(option, function (err, res, data) {
        if (!err) {
            Response.end(data);
        } else {
            Response.end(JSON.stringify({
                status: '1',
                message: JSON.stringify(err)
            }));
        }
    }, Robot);
}

exports.Runner = run;

