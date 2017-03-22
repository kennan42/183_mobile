var MEAP = require("meap");
var REDIS = require("meap_redis");

function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-type", "text/json;charset=utf-8");

    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    if (!(userId)) {
        Response.end(JSON.stringify({
            status: 1,
            msg: "参数错误"
        }));
        return;
    }

    var key = 'phoneNumberLock:' + userId;
    var ttl = 3600;
    var value = {};

    var redisCli = REDIS.createClient(global.redisPort, global.redisHost);
    redisCli.on("ready", function () {  // 准备
        redisCli.select(10, function () {  // 选择10号库
            redisCli.get(key, function (err, data) {  // 获取值
                if (err) {
                    Response.end(JSON.stringify({
                        status: 1,
                        msg: "锁定失败"
                    }));

                    redisCli.quit();
                } else if (data != null) {  // 如果有数据证明被锁中,给用户返回锁内容以及剩余时间
                    redisCli.TTL(key, function (err, ttl) {
                        Response.end(JSON.stringify({
                            status: 2,
                            msg: "已被锁定",
                            data: {
                                ttl: ttl
                            }
                        }));

                        redisCli.quit();
                    });
                } else {  // 如果查不到数据 则证明没有被锁过
                    redisCli.SETEX(key, ttl, JSON.stringify(value), function (err) {
                        if (err) {
                            Response.end(JSON.stringify({
                                status: 1,
                                msg: "锁定失败"
                            }));
                        } else {
                            Response.end(JSON.stringify({
                                status: 0,
                                msg: "锁定成功",
                                data: {
                                    ttl: ttl
                                }
                            }));
                        }

                        redisCli.quit();
                    });
                }
            });
        });
    });


}

exports.Runner = run;
