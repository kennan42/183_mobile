var MEAP = require("meap");
var mongoose = require("mongoose");
var mongoClient = require("mongodb").MongoClient;
var async = require("async");
var analySchema = require("../AnalySchema.js");
var common = require("../common.js");

/**
 * 统计周活跃率
 * @author donghua.wang
 * @date 2016年3月14日 15:06
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("analy.analyWeekActiveRate start");
    var headers = Request.headers;
    var host = headers.host;
    if (host.indexOf("localhost") == -1) {
        Response.end("not auth");
        return;
    }
	Response.end("start analy week active rate");
	
    var date = new Date();
    var preWeekTimes = date.getTime() - 86400 * 7 * 1000;
    date.setTime(preWeekTimes);
	var date1 = new Date();
    date1.setTime(preWeekTimes);
    var preWeekStartTime = common.getWeekStartTime(date);
    var preWeekEndTime = common.getWeekEndTime(date1);
    var preWeekStartTimes = preWeekStartTime.getTime();
    var preWeekEndTimes = preWeekEndTime.getTime();
    var preWeekStartDate = common.date2str(preWeekStartTime, "yyyy-MM-dd");
    var preWeekEndDate = common.date2str(preWeekEndTime, "yyyy-MM-dd");
    var times = Date.now();
	console.log("week",preWeekStartDate,preWeekEndDate);

    var conn = mongoose.createConnection(global.mongodbURL);
    var analyLoginModel = conn.model("analy_login", analySchema.AnalyLoginSchema);
    var analyActiveRateModel = conn.model("analy_active_rate", analySchema.AnalyActiveRateSchema);
    async.parallel([
    //查询上周的活跃用户用户
    function(cb) {
        analyLoginModel.distinct("userId", {
            "createTime" : {
                "$gte" : preWeekStartTimes,
                "$lte" : preWeekEndTimes
            }
        }, function(err,data) {
            cb(err,data);
        });
    },
    //查询总安装数
    function(cb) {
        mongoClient.connect(global.mongodbURL,function(err,db){
            var coll = db.collection("analy_first_logins");
            coll.count({},function(err,data){
                db.close();
                cb(err,data);
            });
        });
    }], function(err, data) {
        //计算活跃率
        var activeUsersCount = data[0].length;
        var totalUserCount = data[1];
        var activeRate = activeUsersCount/totalUserCount;
        activeRate = common.forDight(activeRate,4);
       analyActiveRateModel.update({
           "activeRateType":"week",
           "startTime":preWeekStartDate,
           "endTime":preWeekEndDate
       },{
           "activeRate":activeRate,
		   "activeCount":activeUsersCount,
           "createTime":times
       },{
           "upsert":true
       },function(err){
           conn.close();
           console.log("analy.analyWeekActiveRate end");
       });
    });
}

exports.Runner = run;

