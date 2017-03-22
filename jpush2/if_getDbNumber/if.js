var MEAP = require("meap");
var async = require("async");
var arg = "";
function run(Param, Robot, Request, Response, IF) {

    Response.setHeader("Content-Type", "application/json;charset=utf8");

    arg = JSON.parse(Param.body.toString());
    var num = 0;

    async.parallel([findA, findB, findC, findD], function(err, data) {

       
        num = data[0] + data[1] + data[2] + data[3];
        if (!err) {

           
            Response.end(JSON.stringify({
               
                "number" : 55

            }));
        } else {
           

        }

    });

}

//ZHRWS_GET_OT_CO_LINES
function findA(callback) {

    var paramJSon = {
        "IS_PUBLIC" : {
            "FLOWNO" : "",
            "PERNR" : "",
            "ZDOMAIN" : "400"
        },
        "P_SP_PERNR" : arg.userid,
        "P_SP_STATUS" : 0
    };
    var option = {
        // agent : false,
        method : "POST",
        url : global.baseURL + "/zhrws/ZHRWS_GET_OT_CO_LINES",
        Body : paramJSon
    };

    MEAP.AJAX.Runner(option, function(err, res, data) {
        if (!err) {

            data = JSON.parse(data);
            var num1 = data.E_2005;
            var num2 = data.E_2011;

            callback(err, parseInt(num1) + parseInt(num2));
        } else {
            callback(err, 0);
        }

    });

}

function findB(callback) {
    var paramJSon = {
        "input" : {
            "channelSerialNo" : new Date().getTime(), //序列号
            "currUsrId" : arg.userid, //员工号
            "domain" : "400",
            "extendMap" : {
                "entry" : [{
                    "Key" : "",
                    "Value" : ""
                }]
            },
            "qryType" : "4",
            "userId" : arg.userid,
            "lastTime" : "", //获取当天日期
            "bussType" : "2001", //代表休假待审列表
            "startPage" : 1,
            "pageSize" : 1000
        }
    };

    var option = {
        // agent : false,
        method : "POST",
        url : global.baseURL + "/portal/PORTAL_BPMI_TaskListQry",
        Body : paramJSon
    };
    MEAP.AJAX.Runner(option, function(err, res, data) {
        if (!err) {

            data = JSON.parse(data);

            if (data.output.type == "S") {

                callback(err, parseInt(data.output.totalCount));
            } else {
                callback(err, 0);
            }
        } else {
            callback(err, 0);
        }
    });

}

//查询会议室的带审批的数量
function findC(cb) {
    var option = {
        //  agent : false,
        url : global.baseURL + "/meet/examine",
        method : "post",
        Body : {
            "state" : "0",
            "pageNumber" : 1,
            "pageSize" : 1,
            "userId" : arg.userid
        }
    };
    MEAP.AJAX.Runner(option, function(err, res, data) {
        if (!err) {
            var data = JSON.parse(data);

            cb(null, data.count);

        } else {
            cb(null, 0);
        }
    });
}

//查看文档平台的代办的数量
function findD(callback) {

    var option = {
        // agent:false,
        url : global.baseURL + "/docPlatform/PORTALBPMIWaitTaskNumImplBean",
        method : "post",
        Body : {
            "input" : {
                "channelSerialNo" : new Date().getTime(), // 时间戳 + 123456789
                "currUsrId" : arg.userid,
                "domain" : 400,
                "reqUsrId" : arg.userid
            }
        }
    };
    MEAP.AJAX.Runner(option, function(err, res, data) {
        if (!err) {

            data = JSON.parse(data);

            if (data.output.type == "S") {
                var num1 = parseInt(data.output.fmsSaveWTNum) + parseInt(data.output.fmsReadWTNum) + parseInt(data.output.fmsDestWTNum);
                callback(err, num1);
            } else {
                callback(err, 0);
            }

        } else {
            callback(null, 0);
        }
    });

}

exports.Runner = run;

