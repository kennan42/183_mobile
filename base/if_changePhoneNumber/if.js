var MEAP = require("meap");
var REDIS = require("meap_redis");

function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-type", "text/json;charset=utf-8");

    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var phoneNum = arg.phoneNum;
    if (!(userId && phoneNum)) {
        Response.end(JSON.stringify({
            status: "1",
            msg: "参数错误"
        }));
        return;
    }

    var key = 'phoneNumberLock:' + userId;

    var redisCli = REDIS.createClient(global.redisPort, global.redisHost);
    redisCli.on("ready", function () {  // 准备
        redisCli.select(10, function () {  // 选择10号库
            redisCli.get(key, function (err, data) {  // 获取是否被锁
                if (err) {
                    Response.end(JSON.stringify({
                        status: 1,
                        msg: "修改失败"
                    }));

                    redisCli.quit();
                } else if (data != null) { // 如果被锁,不能修改
                    Response.end(JSON.stringify({
                        status: 2,
                        msg: "账号被锁无法修改手机号"
                    }));

                    redisCli.quit();
                } else {
                    key = 'phoneNumberChange:' + userId;
                    redisCli.get(key, function (err, data) {  // 获取是否处于一个重置任务中
                        if (err) {
                            Response.end(JSON.stringify({
                                status: 1,
                                msg: "修改失败"
                            }));

                            redisCli.quit();
                        } else if (data != null) { // 如果处于一个重置任务中就改手机号
                            zhrtxws12(Robot, userId, phoneNum, function (err, data) {
                                // 如果修改成功,就删除redis中的这条数据
                                if (!(!err && data && data.ES_PUBLIC && data.ES_PUBLIC.CODE == "S")) {
                                    Response.end(JSON.stringify({
                                        status: 1,
                                        msg: data.ES_PUBLIC.MESSAGE
                                    }));
                                    redisCli.quit();
                                } else {
                                    // 更新通讯旅
                                    updateBaseUserPhone(Robot, userId, phoneNum, function (err) {
                                        if (err) {
                                            Response.end(JSON.stringify({
                                                status: 4,
                                                msg: "手机号修改成功，可以正常使用，您若发现天信中展示有问题，请次日再试！给您带来不便请您谅解"
                                            }));
                                        } else {
                                            Response.end(JSON.stringify({
                                                status: 0,
                                                msg: data.ES_PUBLIC.MESSAGE
                                            }));
                                        }

                                        redisCli.DEL(key, function (err, ttl) {
                                            redisCli.quit();
                                        });
                                    });
                                }
                            })
                        } else { // 如果未处于一个重置任务中不能修改
                            Response.end(JSON.stringify({
                                status: 3,
                                msg: "未处于一个重置任务中"
                            }));

                            redisCli.quit();
                        }
                    });
                }
            });
        });
    });


}

/**
 *
 * @param Robot
 * @param userId
 * @param phoneNum
 * @param cb
 */
function zhrtxws12(Robot, userId, phoneNum, cb) {
    var option = {
        method: "POST",
        url: global.baseURL + "/zhrtxws/zhrtxws12",
        Cookie: "true",
        Enctype: "application/json",
        Body: JSON.stringify({
            "IM_PERNR": userId,
            "IM_TEL": phoneNum
        })
    };
    MEAP.AJAX.Runner(option, function (err, res, data) {
        if (err != null || data == null) {
            cb(err, {});
            return
        }
        cb(null, JSON.parse(data));
    }, Robot);
}

/**
 * 更新基础数据的电话号码
 * @param Robot
 * @param userId
 * @param phoneNum
 * @param cb
 */
function updateBaseUserPhone(Robot, userId, phoneNum, cb) {
    var option = {
        method: "POST",
        url: global.baseURL + "/contact/updatePhone",
        Cookie: "true",
        Enctype: "application/json",
        Body: JSON.stringify({
            "userId": userId,
            "phoneNum": phoneNum
        })
    };
    MEAP.AJAX.Runner(option, function (err, res, data) {
        if (err != null || data == null || data.status != 0) {
            cb(err, {});
            return
        }
        cb(null, JSON.parse(data));
    }, Robot);
}

exports.Runner = run;
