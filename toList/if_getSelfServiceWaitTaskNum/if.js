/*------------------------------------------------------------
 // Copyright (C) 2015 正益无线（北京）科技有限公司  版权所有。
 // 文件名：if.js
 // 文件功能描述：员工自助待办数量,聚合了两个接口
 //
 // 创 建 人：陈恺垣
 // 创建日期：2015.11.20
 //
 // 修 改 人：
 // 修改日期：
 // 修改描述：
 //-----------------------------------------------------------*/

var MEAP = require("meap");
var async = require("async");

function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-type", "text/json;charset=utf-8");

    var arg = JSON.parse(Param.body.toString());
    if (!("channelSerialNo" in arg && "currUsrId" in arg)) {
        Response.end(JSON.stringify({
            status: "1",
            msg: "参数错误"
        }));
        return;
    }

    async.parallel([
        function (cb) {
            PORTALBPMIAIWaitTaskSumImplBean(Param, Robot, Request, Response, IF, cb);
        },
        function (cb) {
            zhrws2222(Param, Robot, Request, Response, IF, cb);
        }
    ], function (err, data) {
        if (err != null) {
            Response.end(JSON.stringify({
                status: 1,
                msg: err
            }));
            return;
        }

        // 总数,分别来自于两个接口
        var num = 0;
        var data1 = data[0];
        if ("output" in data1 && "taskList" in data1.output) {
            num += parseInt("0" + data1.output.taskList.taskNum, 0)
        }

        var data2 = data[1];
        if ("E_LINES" in data2) {
            num += parseInt("0" + data2.E_LINES, 0)
        }

        Response.end(JSON.stringify({
            status: 0,
            msg: "请求成功",
            data: {
                total: num
            }
        }));
    });


}


/**
 * 休假待办数量
 *
 * @param Param
 * @param Robot
 * @param Request
 * @param Response
 * @param IF
 * @param cb
 * @constructor
 */
function PORTALBPMIAIWaitTaskSumImplBean(Param, Robot, Request, Response, IF, cb) {
    var arg = JSON.parse(Param.body.toString());
    var option = {
        method: "POST",
        url: global.baseURL + "/docPlatform/PORTALBPMIAIWaitTaskSumImplBean",
        Cookie: "true",
        Enctype: "application/json",
        Body: JSON.stringify({
            "input": {
                "channelSerialNo": arg.channelSerialNo,
                "currUsrId": arg.currUsrId,
                "domain": "400",
                "extendMap": {
                    "entry": {
                        "Key": "",
                        "Value": ""
                    }
                },
                "bussType": "2001",
                "beginDate": "",
                "endDate": ""
            }
        })
    };

    MEAP.AJAX.Runner(option, function (err, res, data) {
        if (err != null) {
            cb(err, {});
            return
        }
        cb(err, JSON.parse(data));
    }, Robot);
}

/**
 * 加班考勤异常待办数量
 *
 * @param Param
 * @param Robot
 * @param Request
 * @param Response
 * @param IF
 * @param cb
 */
function zhrws2222(Param, Robot, Request, Response, IF, cb) {
    var arg = JSON.parse(Param.body.toString());
    var option = {
        method: "POST",
        url: global.baseURL + "/zhrws/zhrws2222",
        Cookie: "true",
        Enctype: "application/json",
        Body: JSON.stringify({
            "P_BEGDA": "",
            "P_ENDDA": "",
            "P_SP_PERNR": arg.currUsrId,
            "P_SP_STATUS": "0"
        })
    };

    MEAP.AJAX.Runner(option, function (err, res, data) {
        if (err != null) {
            cb(err, {});
            return
        }
        cb(err, JSON.parse(data));
    }, Robot);
}

exports.Runner = run;