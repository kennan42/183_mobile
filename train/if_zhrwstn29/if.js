/*------------------------------------------------------------
 // Copyright (C) 2015 正益无线（北京）科技有限公司  版权所有。
 // 文件名：if.js
 // 文件功能描述： 阶段性学习内容查看（配置表）ZHRWSTN29,封装了该接口
 //
 // 创 建 人：杨尚飞
 // 创建日期：2015.12.15
 //
 // 修 改 人：杨尚飞
 // 修改日期：2015.12.25
 // 修改描述：判断字段是否为空并做处理
 //-----------------------------------------------------------*/

var MEAP = require("meap");

function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var option = {
        wsdl : global.train + "/sap/bc/srt/wsdl/flv_10002A111AD1/bndg_url/sap/bc/srt/rfc/sap/zhrwstn29/900/zhrwstn29/zhrwstn29?sap-client=900",
        func : "ZHRWSTN29.ZHRWSTN29.ZHRWSTN29",
        Params : arg,
        agent : false
    };

    MEAP.SOAP.Runner(option, function(err, res, data) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err && data && data.LT_JD_XXNR && data.LT_JD_XXNR.item 
            && data.LT_JD_XXNR.item.length) { 
            for (var i = 0; i < data.LT_JD_XXNR.item.length; i++) {
                var obj = data.LT_JD_XXNR.item[i];
                if(isEmptyObj(obj.ZZ_ZRCY)) {
                    data.LT_JD_XXNR.item[i].ZZ_ZRCY = "";
                }
            };
            Response.end(JSON.stringify(data));
        } else {
            Response.end(JSON.stringify({
                status : '-1',
                message : 'Error'
            }));
        }
    });
}

/**
 * 判断是否为空对象
 * 
 * @param {Object} obj
 */
function isEmptyObj(obj) {
    if(typeof obj != 'object') {
        return false;
        return;
    }

    var flag = true;

    for(var i in obj) {
        flag = false;
        break;
    }

    return flag;
}

exports.Runner = run;
