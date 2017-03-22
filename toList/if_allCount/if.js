/*------------------------------------------------------------
 // Copyright (C) 2015 正益无线（北京）科技有限公司  版权所有。
 // 文件名：if.js
 // 文件功能描述： 员工自助、会议室、下一个会议室待办数接口、B2B（b2b/B2BBPMIWaitTaskSumImplBean）、
 // 档案平台、IT服务、费用报销,等接口的聚合
 //
 // 创 建 人：杨尚飞
 // 创建日期：2015.12.26
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
    if (!("channelSerialNo" in arg && "currUsrId" in arg )) {
        Response.end(JSON.stringify({
            staus: "1",
            msg: "参数错误"
        }));
        return;
    }

    async.parallel([
        function (cb) {
            getSelfServiceWaitTaskNum(Param, Robot, Request, Response, IF, cb);
        },
        function (cb) {
            ifAdmin(Param, Robot, Request, Response, IF, cb);
        },
        function (cb) {
            B2BBPMIWaitTaskSumImplBean(Param, Robot, Request, Response, IF, cb);
        },
        function (cb) {
            getDocPlatformCount(Param, Robot, Request, Response, IF, cb);
        },
        //暂未上线
        function (cb) {
           getITServiceCount(Param, Robot, Request, Response, IF, cb);
        },
        function (cb) {
            getCost(Param, Robot, Request, Response, IF, cb);
        },
        //新员工培训
        function (cb) {
            getTrain(Param, Robot, Request, Response, IF, cb);
        }
    ], function (err, data) {
        if (err != null) {
            Response.end(JSON.stringify({
                staus: "1",
                err: err,
                data: data
            }));
            return;
        }

        //获取总条数
        var total = 0;
        for (var i = 0; i < data.length; i++) {
            total += data[i]
        }
        var i = 0;
        Response.end(JSON.stringify({
            staus: "0",
            msg: "请求成功",
            data: {
                selfService: data[i++],
                meetRoom: data[i++],
                B2B: data[i++],
                docPlatform: data[i++],
                ITService: data[i++],
                Cost: data[i++],
                Train: data[i++],
                Total: total
                // Total: data[0] + data[1] + data[2] + data[2] + data[3] + data[4] + data[5]
            }
        }));
    });
}

/*
 * 员工自助
 * toList/getSelfServiceWaitTaskNum
 *
 * */
function getSelfServiceWaitTaskNum(Param, Robot, Request, Response, IF, cb) {
    var arg = JSON.parse(Param.body.toString());
    var option = {
        method: "POST",
        url: global.baseURL + "/toList/getSelfServiceWaitTaskNum",
        Cookie: "true",
        agent: "false",
        Enctype: "application/json",
        Body: JSON.stringify({
            "channelSerialNo": arg.channelSerialNo,
            "currUsrId": arg.currUsrId,
            "pageNum": "",
            "pageSize": ""
        })
    };

    MEAP.AJAX.Runner(option, function (err, res, data) {
        if (err != null) {
            cb(err, 0);
            return
        }
        data = JSON.parse(data);
        var count = 0;
        if (data!=null&&data.status!= null&&data.status == 0) {
            var count = data.data.total;
        }
        cb(err, Number(count));
    }, Robot);

}
/*
 *
 *会议室
 *meet/ifAdmin
 *
 * */
function ifAdmin(Param, Robot, Request, Response, IF, cb) {
    var arg = JSON.parse(Param.body.toString());
    var option = {
        method: "POST",
        url: global.baseURL + "/meet/ifAdmin ",
        Cookie: "true",
        agent: "false",
        Enctype: "application/json",
        Body: JSON.stringify({
            "userId": arg.currUsrId
        })
    };

    MEAP.AJAX.Runner(option, function (err, res, data) {
        if (err != null) {
            cb(err, 0);
            return
        }
        data = JSON.parse(data);
       if (data&&data.isAdmin == 1) {
            examine(Param, Robot, Request, Response, IF, cb);
        } else {
            cb(err, 0);
        }
    }, Robot);
}
/**
 *
 * 下一个会议室待办数接口
 * meet/examine
 *
 * */

function examine(Param, Robot, Request, Response, IF, cb) {
    var arg = JSON.parse(Param.body.toString());
    var option = {
        method: "POST",
        url: global.baseURL + "/meet/examine ",
        Cookie: "true",
        agent: "false",
        Enctype: "application/json",
        Body: JSON.stringify({
            "state": '0',
            'userId': arg.currUsrId,
            'pageSize': 1,
            'pageNum': 1
        })
    };

    MEAP.AJAX.Runner(option, function (err, res, data) {
        if (err != null) {
            cb(err, 0);
            return
        }
        data = JSON.parse(data);
        var count = 0;
        if (data&&data.status == 0) {
            count = data.count;
        }
        cb(err, Number(count));
    }, Robot);
}
/*
 * B2B
 * b2b/B2BBPMIWaitTaskSumImplBean
 *
 * */

function B2BBPMIWaitTaskSumImplBean(Param, Robot, Request, Response, IF, cb) {
    var arg = JSON.parse(Param.body.toString());
    var option = {
        method: "POST",
        url: global.baseURL + "/b2b/B2BBPMIWaitTaskSumImplBean ",
        Cookie: "true",
        agent: "false",
        Enctype: "application/json",
        Body: JSON.stringify({
            "input": {
                "channelSerialNo": arg.channelSerialNo,
                "currUsrId": arg.currUsrId,
                "domain": 400,
                "extendMap": {
                    "entry": [{
                        "Key": "",
                        "Value": ""
                    }]
                }
            }
        })
    };

    MEAP.AJAX.Runner(option, function (err, res, data) {
        if (err != null) {
            cb(err, 0);
            return
        }
        data = JSON.parse(data);
        var sums = 0;
        if (data&&data.output.type == 'S') {
            var waitTaskSumList = data.output.waitTaskSumList;
            var listArr = [];
            if (undefined != waitTaskSumList) {
                if (undefined != waitTaskSumList.length) {
                    listArr = waitTaskSumList;
                } else {
                    listArr.push(waitTaskSumList);
                }
                for (var i = 0; i < listArr.length; i++) {
                    if (undefined != listArr[i].taskNum) {
                        sums += parseInt(listArr[i].taskNum);
                    }
                }

            }
        } else {
            sums = 0;
        }
        cb(err, Number(sums));
    }, Robot);
}

/*
 *
 * 档案平台
 * docPlatform/PORTALBPMIAIWaitTaskSumImplBean
 *
 * */

function getDocPlatformCount(Param, Robot, Request, Response, IF, cb) {
    var arg = JSON.parse(Param.body.toString());
    var option = {
        method: "POST",
        url: global.baseURL + "/docPlatform/PORTALBPMIAIWaitTaskSumImplBean ",
        Cookie: "true",
        agent: "false",
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
                "bussType": "FMS",
                "beginDate": "",
                "endDate": ""
            }
        })
    };

    MEAP.AJAX.Runner(option, function (err, res, data) {
        var count = 0;
        if (err != null) {
            cb(err, 0);
            return
        }
        data = JSON.parse(data);
        if (data&&data.output.type == "S") {
            if (!(data.output.taskList instanceof Array) && data.output.taskList instanceof Object) {
                data.output.taskList = [data.output.taskList];
            }
            for (var i = 0; i < data.output.taskList.length; i++) {
                count += parseInt(data.output.taskList[i].taskNum, 10);
            }
        } else {
            count = 0;
        }
        cb(err, Number(count));
    }, Robot);
}

/**
 *
 * IT服务
 * docPlatform/PORTALBPMIAIWaitTaskSumImplBean
 *
 * */
function getITServiceCount(Param, Robot, Request, Response, IF, cb) {
    var arg = JSON.parse(Param.body.toString());
    var option = {
        method: "POST",
        url: global.baseURL + "/docPlatform/PORTALBPMIAIWaitTaskSumImplBean ",
        Cookie: "true",
        agent: "false",
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
                "bussType": "ITS",
                "beginDate": "",
                "endDate": ""
            }
        })
    };

    MEAP.AJAX.Runner(option, function (err, res, data) {
        if (err != null) {
            cb(err, 0);
            return
        }
        var count = 0;
        data = JSON.parse(data);
        if (data&&data.output.type == "S") {
            if (!(data.output.taskList instanceof Array) && data.output.taskList instanceof Object) {
                data.output.taskList = [data.output.taskList];
            }
            for (var i = 0; i < data.output.taskList.length; i++) {
                count += parseInt(data.output.taskList[i].taskNum, 10);
            }

        } else {
            count = 0;
        }
        cb(err, Number(count));
    }, Robot);
}

/**
 *
 * 费用报销
 * cost/EMCMBAIWaitTaskSumQryImplBean
 *
 *
 * */

function getCost(Param, Robot, Request, Response, IF, cb) {
    var arg = JSON.parse(Param.body.toString());
    var option = {
        method: "POST",
        url: global.baseURL + "/cost/EMCMBAIWaitTaskSumQryImplBean",
        Cookie: "true",
        agent: "false",
        Enctype: "application/json",
        Body: JSON.stringify({
            "Input": {
                "channelSerialNo": arg.channelSerialNo,
                "currUsrId": arg.currUsrId,
                "domain": "400",
                "extendMap": {
                    "entry": {
                        "Key": "",
                        "Value": ""
                    }
                },
                "usrId": arg.currUsrId
            }
        })
    };

    MEAP.AJAX.Runner(option, function (err, res, data) {
        if (err != null) {
            cb(err, 0);
            return
        }
        data = JSON.parse(data);
        var count = 0;
        if (data && data.Output && data.Output.type && data.Output.type == 'S') {
            var count = data.Output.totalCnt || 0;
        }
        cb(err, Number(count));
    }, Robot);
}
/**
 *
 * 新员工培训
 * train/PORTALBPMIAIWaitTaskSumImplBean
 *
 *
 * */
function getTrain(Param, Robot, Request, Response, IF, cb){
    var arg = JSON.parse(Param.body.toString());
    var option = {
        method: "POST",
        url: global.baseURL + "/train/PORTALBPMIAIWaitTaskSumImplBean",
        Cookie: "true",
        agent: "false",
        Enctype: "application/json",
        Body: JSON.stringify({
          "input": {
            "channelSerialNo":arg.channelSerialNo,
            "currUsrId": arg.currUsrId,
            "domain": "400",
            "extendMap": {
              "entry": {
                "Key": "",
                "Value": ""
              }
            },
            "bussType": "ST",
            "beginDate": "",
            "endDate": ""
          }
        })
    };

    MEAP.AJAX.Runner(option, function (err, res, data) {
        if (err != null) {
            cb(err, 0);
            return
        }
        var count = 0;
        data = JSON.parse(data);
        if (data&&data.output&&data.output.type == "S") {
            if (!(data.output.taskList instanceof Array) && data.output.taskList instanceof Object) {
                data.output.taskList = [data.output.taskList];
            }
            for (var i = 0; i < data.output.taskList.length; i++) {
                count += parseInt(data.output.taskList[i].taskNum, 10);
            }

        } else {
            count = 0;
        }
        cb(err, Number(count));
    }, Robot);
}
exports.Runner = run;

