/*------------------------------------------------------------
 // Copyright (C) 2015 正益无线（北京）科技有限公司  版权所有。
 // 文件名：if.js
 // 文件功能描述： 学习计划查看ZHRWSTN13,封装了该接口
 //
 // 创 建 人：杨尚飞
 // 创建日期：2015.12.15
 //
 // 修 改 人：杨尚飞
 // 修改日期：2015.12.16
 // 修改描述：operation name发生了改变
 //-----------------------------------------------------------*/
var MEAP = require("meap");

function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var option = {
        wsdl : global.train + "/sap/bc/srt/wsdl/flv_10002A111AD1/bndg_url/sap/bc/srt/rfc/sap/zhrwstn13/900/zhrwstn13/zhrwstn13?sap-client=900",
        func : "ZHRWSTN13.ZHRWSTN13.ZHRWSTN13",
        Params : arg,
        agent : false
    };

    MEAP.SOAP.Runner(option, function(err, res, data) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err) {
            Response.end(JSON.stringify(data));
        } else {
            Response.end(JSON.stringify({
                status : '-1',
                message : 'Error'
            }));
        }
    });
}

exports.Runner = run;
