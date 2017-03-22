var MEAP=require("meap");
var async = require("async");
var REDIS = require("meap_redis");
var common = require("../common.js");

function run(Param, Robot, Request, Response, IF)
{
    Response.setHeader("Content-Type","text/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var startDate = arg.startDate;
    var endDate = arg.endDate;
    var toDate = arg.toDate;
    
    var sql = " SELECT \"MTYPEC\", \"MTYPET\", sum(\"COUNT_NUM\") AS \"COUNT_NUM\", "
            + " sum(\"COUNT_RATIO\") AS \"COUNT_RATIO\" "
            + " FROM \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.pubjob/CA_EMP_PUBJOB_INDEX_KPI1\" "
            + " ('PLACEHOLDER' = ('$$BEGDA$$', ':startDate'), 'PLACEHOLDER' = ('$$ENDDA$$', ':endDate'), "
            + " 'PLACEHOLDER' = ('$$TODATE$$', ':toDate')) "
            + " GROUP BY \"MTYPEC\", \"MTYPET\" ";
    sql = sql.replace(":startDate",startDate).replace(":endDate",endDate).replace(":toDate",toDate);
    console.log(sql);
    var content = common.decode2Hash(sql);

    var keys = [
        {
            oldKey: "UNION_COL2",
            newKey: "COUNT_NUM"
        }, {
            oldKey: "UNION_COL3",
            newKey: "COUNT_RATIO"
        }
    ];
    //common.getHANAData(content, sql, Response, keys);
    common.getHANAData(content, sql, Response, keys, arg, "index", "hr");


    //var rs = null;
    // async.series([
    //     function(cb) {
    //        var redisCli = REDIS.createClient(global.redisPort, global.redisHost);
    //        redisCli.on("ready", function() {
    //            redisCli.select(10, function() {
    //                redisCli.get(content, function(err, data) {
    //                    redisCli.quit();
    //                    if (data != null) {
    //                        console.log("result from redis");
    //                        data = JSON.parse(data);
    //                        Response.end(JSON.stringify({
    //                            "status" : "0",
    //                            "data" : data
    //                        }));
    //                    } else {
    //                        cb(null, "");
    //                    }
    //                });
    //            });
    //        });
    //},function(cb) {
    //    var jdbc = new ( require('jdbc') );
    //    jdbc.initialize(global.hanaConfig, function(err, res) {
    //        jdbc.open(function(err, conn) {
    //            jdbc.executeQuery(sql, function(err, rows) {
    //                jdbc.close(function(err) {
    //                });
    //                rs = handleResult(rows);
    //                console.log("result from hana");
    //                Response.end(JSON.stringify({
    //                    "status" : "0",
    //                    "data" : rs
    //                }));
    //                cb(null, "");
    //            });
    //        });
    //    });
    //},function(cb) {
    //    var redisCli = REDIS.createClient(global.redisPort, global.redisHost);
    //    redisCli.on("ready", function() {
    //        redisCli.select(10, function() {
    //            redisCli.SETEX(content, common.ttl, JSON.stringify(rs), function(err) {
    //                console.log("save result to redis");
    //                redisCli.quit();
    //                cb(null, "");
    //            });
    //        });
    //    });
    //}],function(err,data){
    //    console.log("analy over");
    //});
}

function handleResult(rows){
    var arr = [];
    for (var i in rows) {
        var item = rows[i];
        for (var j in item) {
            if (j.toUpperCase().indexOf("UNION_COL2") != -1) {
                item.COUNT_NUM = item[j];
                delete item[j];
            }
            if (j.toUpperCase().indexOf("UNION_COL3") != -1) {
                item.COUNT_RATIO = item[j];
                delete item[j];
            }
        }
        arr.push(item);
    }
    return arr;
}

exports.Runner = run;


                                

	

