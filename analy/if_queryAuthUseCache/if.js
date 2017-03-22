var MEAP = require("meap");
var async = require("async");
var REDIS = require("meap_redis");
var common = require("../common.js");

/**
 * HR报表查询用户权限
 * @author donghua.wang
 * @date 2015年8月19日 08:52
 * */
function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type", "text/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
    userId = arg.userId;
    if (userId.length == 7) {
        userId = "0" + userId;
    }
    var sql = " SELECT MIN(\"HIER\") F1 FROM \"_SYS_BIC\".\"cttqdc.metadata.erp.hr.basedata/CA_EMPLOYEE_SUBDEPT_SPEC\" "
            + " WHERE \"UID\" = ':userId' ";
    sql = sql.replace(":userId",userId);
    var hashSql = "queryAuthUseCache~" + decode2Hash(sql);
    var level = null;
    console.info(sql);
    async.series([
        //先从redis里查询用户权限
        function(cb){
            var redisCli = REDIS.createClient(global.redisPort,global.redisHost);
            redisCli.on("ready",function(){
                redisCli.select(10,function(){
                    redisCli.GET(hashSql,function(err,data){
                        redisCli.quit();
                        if(data != null){
                            console.log("result from redis");
                            Response.end(JSON.stringify({
                                "status":"0",
                                "level":data
                            }));
                        }else{//缓存不存在或者过期，则进行回掉
                            cb(null,"");
                        }
                    })
                })
            });
        },
        //从hana查询
        function(cb){
            var jdbc = new ( require('jdbc') );
            var HANAVisitLog = {};
            HANAVisitLog.type = 'auth';
            HANAVisitLog.module = 'auth';
            HANAVisitLog.params = JSON.stringify(arg);
            HANAVisitLog.HANAInit = new Date().getTime();
            console.info(new Date().getTime() + "\tHANA连接初始化");
            jdbc.initialize(global.hanaConfig, function(err, res) {
                if (err != null) {
                    errorLog(Response, err, "JDBC INIT ERROR！");
                    return;
                }
                HANAVisitLog.HANAOpen = new Date().getTime();
                console.info(new Date().getTime() + "\tHANA初始化完毕，打开连接");
                jdbc.open(function(err, conn) {
                    if (err != null) {
                        errorLog(Response, err, "JDBC OPEN ERROR！");
                        return;
                    }
                    HANAVisitLog.HANATimeQueryBegin = new Date().getTime();
                    console.info(new Date().getTime() + "\t连接打开完毕，开始执行SQL");
                    jdbc.executeQuery(sql, function(err, rows) {
                        if (err != null) {
                            errorLog(Response, err, "JDBC EXECUTE ERROR！");
                            return;
                        }
                        HANAVisitLog.HANATimeQueryEnd = new Date().getTime();
                        console.info(new Date().getTime() + "\tSQL 执行完毕，开始处理数据");
                        jdbc.close(function (err) {
                            if (err != null) {
                                errorLog(Response, err, "JDBC CLOSE ERROR！");
                                return;
                            }
                        });
                        var rs = rows[0];
                        for(var i in rs){
                            level = rs[i];
                        }
                        console.info(new Date().getTime() + "\t数据处理完毕");
                        Response.end(JSON.stringify({
                            "status" : "0",
                            "level" : level
                        }));

                        saveHANAVisitLog(HANAVisitLog);

                        cb(null,level);
                    });
                });
            });
        },
        //将从hana的结果缓存到redis
        function(cb){
            var redisCli = REDIS.createClient(global.redisPort,global.redisHost);
            redisCli.on("ready",function(){
                redisCli.select(10,function(){
                    console.log("cache result to redis");
                    redisCli.SETEX(hashSql,common.ttl,level,function(err){
                        redisCli.quit();
                        cb(null,"");
                    });
                });
            });
        }
    ],function(err,data){
        console.log("query auth over");
    });
}

//hash编码
function decode2Hash(str) {
    var crypto = require('crypto');
    var shasum = crypto.createHash('sha1');
    shasum.update(str);
    var d = shasum.digest('hex');
    return d;
}

function errorLog(Response, err, msg) {
    console.info(msg, err);
    Response.end(JSON.stringify({
        "status": "1",
        "data": []
    }));
}

function saveHANAVisitLog(obj) {
    obj.HANAQueryTime = obj.HANATimeQueryEnd - obj.HANATimeQueryBegin;
    obj.createTime = new Date().getTime();

    var HANAVisitLogSchema = require("../HANAVisitLogSchema.js");
    var mongoose = require("mongoose");
    var conn = mongoose.createConnection(global.mongodbURL);
    var HANAVisitLogModel = conn.model("hanaVisitLog", HANAVisitLogSchema.HANAVisitLogSchema);
    var HANAVisitLog = new HANAVisitLogModel(obj);
    HANAVisitLog.save(function (err, data) {
        conn.close();
    });
}


exports.Runner = run;

