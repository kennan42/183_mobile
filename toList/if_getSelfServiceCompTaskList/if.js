/*------------------------------------------------------------
 // Copyright (C) 2015 正益无线（北京）科技有限公司  版权所有。
 // 文件名：if.js
 // 文件功能描述：员工自助已办列表,聚合了两个接口
 //
 // 创 建 人：陈恺垣
 // 创建日期：2015.11.23
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
    if (!("channelSerialNo" in arg && "currUsrId" in arg && "beginDate" in arg &&
        "endDate" in arg && "pageNum" in arg && "pageSize" in arg)) {
        Response.end(JSON.stringify({
            status: "1",
            msg: "参数错误"
        }));
        return;
    }

    // 页数
    var pageNum = parseInt(arg.pageNum, 10);
    // 每页条数
    var pageSize = parseInt(arg.pageSize, 10);

    zhrws2223(Param, Robot, pageNum, pageSize,
        function (err, data) {
            if (err != null) {
                Response.end(JSON.stringify({
                    status: "1",
                    msg: err
                }));
                return;
            }

            // 调用MAS接口要检查是否停机
            if (data.status == -9999) {
                Response.end(JSON.stringify(data));
                return;
            }

            var list = [];
            if ("ET_TITLE" in data && "item" in data.ET_TITLE) {
                list = data.ET_TITLE.item;
                if (!Array.isArray(list)) {
                    list = [list];
                }
            }
            if (!("ES_PUBLIC" in data && "TOTALSIZE" in data.ES_PUBLIC)) {
                data.ES_PUBLIC.TOTALSIZE = list.length;
            }

            if (list.length == pageSize) {
                // 和分页数相同,直接返回

                Response.end(JSON.stringify({
                    status: "0",
                    msg: "请求成功",
                    data: {
                        items: list
                    }
                }));
            } else if (list.length > 0 && list.length < pageSize) {
                // 比分页数小但不为0,说明加班考勤异常数据已经请求完,

                // 开始请求休假数据
                PORTALBPMIAICompTaskListImplBean(Param, Robot, 1, pageSize - list.length,
                    function (err, data1) {
                        if (err != null) {
                            Response.end(JSON.stringify({
                                status: "1",
                                msg: err
                            }));
                            return;
                        }

                        // 调用MAS接口要检查是否停机
                        if (data.status == -9999) {
                            Response.end(JSON.stringify(data));
                            return;
                        }

                        if (("output" in data1 && "taskList" in data1.output)) {
                            var taskList = data1.output.taskList;

                            if (Array.isArray(taskList)) {
                                for (var i in taskList) {
                                    list.push(taskList[i]);
                                }
                            } else {
                                list.push(taskList);
                            }
                        }

                        Response.end(JSON.stringify({
                            status: "0",
                            msg: "数据获取成功",
                            data: {
                                items: list
                            }
                        }));

                    }
                );
            } else {
                // 加班考勤异常已无数据,开始请求休假数据,
                // 由于存在某次返回的数据由 加班考勤异常+休假 两部分组成
                // 所以这里不能直接请求休假某页数据,只能请求休假的两页数据
                // 并从这两页数据中找出可用的数据

                // 已经请求的总条数
                var hasRequest = (pageNum - 1) * pageSize;
                // 加班考勤异常的总条数
                var zhrws2223Total = parseInt(data.ES_PUBLIC.TOTALSIZE, 10);
                // 休假待办已经请求的页数
                var newPageNum = parseInt((hasRequest - zhrws2223Total) / pageSize);

                // 并行获取
                async.parallel([
                    function (cb) {
                        PORTALBPMIAICompTaskListImplBean(Param, Robot, newPageNum + 1, pageSize, cb);
                    },
                    function (cb) {
                        PORTALBPMIAICompTaskListImplBean(Param, Robot, newPageNum + 2, pageSize, cb);
                    }
                ], function (err, data1) {
                    if (err != null) {
                        Response.end(JSON.stringify({
                            status: "1",
                            msg: err
                        }));
                        return;
                    }

                    // 调用MAS接口要检查是否停机
                    for (var i in data1) {
                        if (data1[i].status == -9999) {
                            Response.end(JSON.stringify(data1[i]));
                            return;
                        }
                    }

                    var tempList = [];
                    for (var i in data1) {
                        if (("output" in data1[i] && "taskList" in data1[i].output)) {
                            var taskList = data1[i].output.taskList;

                            if (Array.isArray(taskList)) {
                                for (var i in taskList) {
                                    tempList.push(taskList[i]);
                                }
                            } else {
                                tempList.push(taskList);
                            }
                        }
                    }

                    // 由于存在某次返回的数据由 加班考勤异常+休假 两部分组成
                    // 这里跳过已经给出的休假的数量的余数
                    var beginNum = (hasRequest - zhrws2223Total) % pageSize;
                    for (var i = beginNum; i < beginNum + pageSize && i < tempList.length; i++) {
                        list.push(tempList[i])
                    }

                    Response.end(JSON.stringify({
                        status: "0",
                        msg: "数据获取成功",
                        data: {
                            items: list
                        }
                    }));
                });

            }
        }
    );


}


/**
 * 休假已办数量
 *
 * @param Param
 * @param Robot
 * @param pageNum
 * @param pageSize
 * @param cb
 * @constructor
 */
function PORTALBPMIAICompTaskListImplBean(Param, Robot, pageNum, pageSize, cb) {
    var arg = JSON.parse(Param.body.toString());
    var option = {
        method: "POST",
        url: global.baseURL + "/docPlatform/PORTALBPMIAICompTaskListImplBean",
        Cookie: "true",
        Enctype: "application/json",
        Body: JSON.stringify({
            input: {
                channelSerialNo: arg.channelSerialNo,
                currUsrId: arg.currUsrId,
                domain: "400",
                extendMap: {
                    entry: {
                        Key: "",
                        Value: ""
                    }
                },
                userId: "",
                bussType: "2001",
                beginDate: arg.beginDate,
                endDate: arg.endDate,
                startPage: pageNum,
                pageSize: pageSize
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
 * 加班考勤异常待办列表
 *
 * @param Param
 * @param Robot
 * @param pageNum
 * @param pageSize
 * @param cb
 */
function zhrws2223(Param, Robot, pageNum, pageSize, cb) {
    var arg = JSON.parse(Param.body.toString());
    var beginDate = arg.beginDate.split('-').join("");  // 格式 yyMMdd
    var endDate = arg.endDate.split('-').join("");  // 格式 yyMMdd

    var option = {
        method: "POST",
        url: global.baseURL + "/zhrws/zhrws2223",
        Cookie: "true",
        Enctype: "application/json",
        Body: JSON.stringify({
            IS_PUBLIC: {
                I_PAGENO: pageNum,
                I_PAGESIZE: pageSize
            },
            P_BEGDA: beginDate,
            P_ENDDA: endDate,
            P_SP_PERNR: arg.currUsrId,
            P_SP_STATUS: "1"
        })
    };
    MEAP.AJAX.Runner(option, function (err, res, data) {
        if (err != null || data == null) {
            cb(err, {});
            return
        }
        cb(err, JSON.parse(data));
    }, Robot);
}

exports.Runner = run;