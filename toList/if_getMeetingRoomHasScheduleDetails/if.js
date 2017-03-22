var MEAP = require("meap");
var async = require("async");

function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-type", "text/json;charset=utf-8");

    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var scheduleId = arg.scheduleId;

    if (!(userId && scheduleId)) {
        Response.end(JSON.stringify({
            status: 1,
            msg: "参数错误"
        }));
        return;
    }


    searchSchedule(Param, Robot, scheduleId, function (err, scheduleDetail) {
        if (err != null) {
            Response.end(JSON.stringify({
                status: 1,
                msg: err
            }));
            return;
        }
        var userIdArr = [];
        if (scheduleDetail.userId) {
            userIdArr.push({
                PERNR: scheduleDetail.userId
            });
        }
        if (scheduleDetail.servicePersonal) {
            for (var i in scheduleDetail.servicePersonal) {
                userIdArr.push({
                    PERNR: scheduleDetail.servicePersonal[i].userId
                });
            }
        }
        if (scheduleDetail.technicist) {
            for (var i in scheduleDetail.technicist) {
                userIdArr.push({
                    "PERNR": scheduleDetail.technicist[i].userId
                });
            }
        }

        ZHR_GET_PER_EASY_INFO(Param, Robot, userIdArr, function (err, userDetails) {
            scheduleDetail["userPhone"] = userDetails[scheduleDetail.userId].TELL;
            if (scheduleDetail.servicePersonal) {
                for (var i in scheduleDetail.servicePersonal) {
                    var userId = scheduleDetail.servicePersonal[i].userId;
                    var BUMEN = userDetails[userId].BUMEN;
                    var TELL = userDetails[userId].TELL;

                    scheduleDetail.servicePersonal[i]['BUMEN'] = BUMEN;
                    scheduleDetail.servicePersonal[i]['TELL'] = TELL;

                    if (userId.length < 8) {
                        userId = '0' + userId;
                    }
                    var photoUrl = global.nginxURL + "uploads/photo/compress_" + userId + ".jpg";
                    scheduleDetail.servicePersonal[i]['photo'] = photoUrl;
                }
            }
            if (scheduleDetail.technicist) {
                for (var i in scheduleDetail.technicist) {
                    var userId = scheduleDetail.technicist[i].userId;
                    var BUMEN = userDetails[userId].BUMEN;
                    var TELL = userDetails[userId].TELL;

                    scheduleDetail.technicist[i]['BUMEN'] = BUMEN;
                    scheduleDetail.technicist[i]['TELL'] = TELL;

                    if (userId.length < 8) {
                        userId = '0' + userId;
                    }
                    var photoUrl = global.nginxURL + "uploads/photo/compress_" + userId + ".jpg";
                    scheduleDetail.technicist[i]['photo'] = photoUrl;
                }
            }

            Response.end(JSON.stringify({
                status: 0,
                msg: "查询成功",
                data: {
                    scheduleDetail: scheduleDetail
                }
            }));

        })
    });
}

/**
 * 查询会议室预定预定详情
 *
 * @param Param
 * @param Robot
 * @param scheduleId
 * @param cb({}) 对象,预约详情
 */
function searchSchedule(Param, Robot, scheduleId, cb) {
    var option = {
        method: "POST",
        url: global.baseURL + "/meet/searchSchedule",
        Cookie: "true",
        Enctype: "application/json",
        Body: JSON.stringify({
            scheduleId: scheduleId
        })
    };
    MEAP.AJAX.Runner(option, function (err, res, data) {
        if (err != null || data == null) {
            cb(err, {});
            return
        }
        data = JSON.parse(data);
        if (data.status != 0) {
            cb(err, {});
            return
        }
        cb(null, data.data);
    }, Robot);
}

/**
 * 批量查询由工号获得姓名、岗位、公司、部门、电话
 *
 * @param Param
 * @param Robot
 * @param userIdArr [{"PERNR":"xxxx"},....] 用户ID数组,不用担心重复问题,WS接口会给出不重复的数据
 * @param cb({}) 数组,每个传入的工号的详情,以ID为详情
 * @constructor
 */
function ZHR_GET_PER_EASY_INFO(Param, Robot, userIdArr, cb) {
    var option = {
        method: "POST",
        url: global.baseURL + "/zhr/ZHR_GET_PER_EASY_INFO",
        Cookie: "true",
        Enctype: "application/json",
        Body: JSON.stringify({
            "IS_PUBLIC": {
                "FLOWNO": "",
                "PERNR": "",
                "ZDOMAIN": "",
                "I_PAGENO": "",
                "I_PAGESIZE": ""
            },
            "P_DATE": "",
            "P_PERNR": {
                "item": userIdArr
            }
        })
    };

    MEAP.AJAX.Runner(option, function (err, res, data) {
        if (err != null || data == null) {
            cb(err, {});
            return
        }
        data = JSON.parse(data);
        if (!(data.EASY_TAB && data.EASY_TAB.item)) {
            cb(null, []);
            return
        }

        // 将查询到的数组转成 {用户ID:用户详情} 以便后续使用
        var result = {};
        for (var i in data.EASY_TAB.item) {
            var userId = data.EASY_TAB.item[i].PERNR;
            // 处理前导0
            if (userId.length > 7) {
                userId = userId.substr(userId.length - 7);
            }
            result[userId] = data.EASY_TAB.item[i]
        }

        cb(null, result);
    }, Robot);
}

exports.Runner = run;