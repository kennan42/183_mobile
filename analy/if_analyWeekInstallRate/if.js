var MEAP=require("meap");
var mongoose = require("mongoose");
var mongoClient = require("mongodb").MongoClient;
var async = require("async");
var analySchema = require("../AnalySchema.js");
var common = require("../common.js");

/**
 * 统计周安装率
 * @author donghua.wang
 * @date 2016年3月14日 16:45
 * */
function run(Param, Robot, Request, Response, IF)
{
    console.log("analy.analyWeekInstallRate start");
    var headers = Request.headers;
    var host = headers.host;
    if (host.indexOf("localhost") == -1) {
        Response.end("not auth");
        return;
    }
	Response.end("start analy week install rate");
	
    var date = new Date();
    var preWeekTimes = date.getTime() - 86400 * 7 * 1000;
    date.setTime(preWeekTimes);
    var date1 = new Date();
    date1.setTime(preWeekTimes);
    var preWeekStartTime = common.getWeekStartTime(date);
    var preWeekEndTime = common.getWeekEndTime(date1);
    var preWeekStartDate = common.date2str(preWeekStartTime, "yyyy-MM-dd");
    var preWeekEndDate = common.date2str(preWeekEndTime, "yyyy-MM-dd");
    var times = Date.now();
    console.log("week",preWeekStartDate,preWeekEndDate);
    var conn = mongoose.createConnection(global.mongodbURL);
    async.parallel([
        //查询所有用户
        function(cb){
            mongoClient.connect(global.mongodbURL,function(err,db){
            var coll = db.collection("base_users");
            coll.count({"STAT1":{"$in":["A","B","C","D"]}},function(err,data){
                db.close();
                cb(err,data);
            });
        });
        },
        //查询安装用户
        function(cb){
            var analyFirstLoginModel = conn.model("analy_first_login",analySchema.AnalyFirstLoginSchema);
            analyFirstLoginModel.count({},function(err,data){
                cb(err,data);
            });
        }
    ],function(err,data){
        //计算安装率
        var userCount = data[0];
        var installCount = data[1];
        var installRate = installCount/userCount;
        installRate = common.forDight(installRate,4);
        var analyInstallRateModel = conn.model("analy_install_rate",analySchema.AnalyInstallRateSchema);
        analyInstallRateModel.update({
            "installRateType":"week",
            "startTime":preWeekStartDate,
            "endTime":preWeekEndDate
        },{
            "installRate":installRate,
			"installCount":installCount,
			 "createTime":times
        },{
            "upsert":true
        },function(err){
            conn.close();
            console.log("analy.analyWeekInstallRate end");
        });
    });
}

exports.Runner = run;
