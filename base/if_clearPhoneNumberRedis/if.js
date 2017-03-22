var MEAP = require("meap");
var REDIS = require("meap_redis");

function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-type", "text/plain;charset=utf-8");

    var userId = Param.params.id;

    console.info(userId);

    var redisCli = REDIS.createClient(global.redisPort, global.redisHost);
    redisCli.on("ready", function () {  // 准备
        redisCli.select(10, function () {  // 选择10号库
            var key = 'phoneNumberLock:' + userId;
            redisCli.DEL(key, function (err, data) {  // 获取值
                key = 'phoneNumberChange:' + userId;
                redisCli.DEL(key, function (err, data) {  // 获取值
                    Response.end(JSON.stringify({
                        status: 0,
                        msg: "success"
                    }));
                });
            });
        });
    });


}

exports.Runner = run;
