/*------------------------------------------------------------
 // Copyright (C) 2015 正益无线（北京）科技有限公司  版权所有。
 // 文件名：if.js
 // 文件功能描述：zabbix自动生成告警代码
 //
 // 创 建 人：夏林
 // 创建日期：2016.6.13
 //
 // 修 改 人：
 // 修改日期：
 // 修改描述：
 //-----------------------------------------------------------*/
var MEAP = require("meap");

function run(Param, Robot, Request, Response, IF) {
    console.log("Auto fabu zabbix");
    Response.setHeader("Content-type", "text/json;charset=utf-8");
    var option = {
        method: "POST",
        url: global.its + "/its-gwy/mainques/buildQuesAuto.json",
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

