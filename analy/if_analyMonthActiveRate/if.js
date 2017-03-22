var MEAP = require("meap");
var mongoose = require("mongoose");
var mongoClient = require("mongodb").MongoClient;
var async = require("async");
var analySchema = require("../AnalySchema.js");
var common = require("../common.js");

/**
 * 统计月活跃率
 * @author donghua.wang
 * @date 2016年3月14日 15:06
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("analy.analyMonthActiveRate start");
    var headers = Request.headers;
    var host = headers.host;
    if (host.indexOf("localhost") == -1) {
        Response.end("not auth");
        return;
    }
	Response.end("start analy month active rate");
	
    var date = new Date();
    var preMonthTimes = date.getTime() - 86400 * 7 * 1000;
    date.setTime(preMonthTimes);
	var date1 = new Date();
    date1.setTime(preMonthTimes);
    var preMonthStartTime = common.getMonthStartTime(date);
    var preMonthEndTime = common.getMonthEndTime(date1);
    var preMonthStartTimes = preMonthStartTime.getTime();
    var preMonthEndTimes = preMonthEndTime.getTime();
    var preMonthStartDate = common.date2str(preMonthStartTime, "yyyy-MM-dd");
    var preMonthEndDate = common.date2str(preMonthEndTime, "yyyy-MM-dd");
    var times = Date.now();
	console.log("month",preMonthStartDate,preMonthEndDate);

    var conn = mongoose.createConnection(global.mongodbURL);
    var analyLoginModel = conn.model("analy_login", analySchema.AnalyLoginSchema);
    var analyActiveRateModel = conn.model("analy_active_rate", analySchema.AnalyActiveRateSchema);
    async.parallel([
    //查询上周的用户
    function(cb) {
        analyLoginModel.distinct("userId", {
            "createTime" : {
                "$gte" : preMonthStartTimes,
                "$lte" : preMonthEndTimes
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
           "activeRateType":"month",
           "startTime":preMonthStartDate,
           "endTime":preMonthEndDate
       },{
           "activeRate":activeRate,
           "createTime":times,
		   "activeCount":activeUsersCount
       },{
           "upsert":true
       },function(err){
           conn.close();
           console.log("analy.analyMonthActiveRate end");
       });
    });
}

exports.Runner = run;

