var MEAP = require("meap");
var mongoose = require("mongoose");
var async = require("async");
var analySchema = require("../AnalySchema.js");
var common = require("../common.js");

/**
 * 按天，周，月统计子应用的访问率（二跳率）
 * @author donghua.wang
 * @date 2016年3月15日 09:27
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("analy.analySubappAccessRate start");
    var headers = Request.headers;
    var host = headers.host;
    if (host.indexOf("localhost") == -1) {
        Response.end("not auth");
        return;
    }
    Response.end("analy.analySubappAccessRate start");

    var params = Param.params;
    var type = params.type;
    var date = getDateTime(type);
    calculateAccessRate(date, type)
}

//根据统计类型计算时间的起始点
function getDateTime(type) {
    var date = new Date();
    var date1 = new Date();
    var startDate = null;
    var endDate = null;
    if (type == "date") {//计算昨天的时间
        var times = date.getTime() - 86400 * 1000;
        date.setTime(times);
        date1.setTime(times);
        startDate = common.getDateStartTime(date);
        endDate = common.getDateEndTime(date1);
    } else if (type == "week") {//计算上周的时间
        var times = date.getTime() - 86400 * 1000 * 7;
        date.setTime(times);
        date1.setTime(times);
        startDate = common.getWeekStartTime(date);
        endDate = common.getWeekEndTime(date1);
    } else {//计算上月的时间
        var times = date.getTime() - 86400 * 1000 * 7;
        date.setTime(times);
        date1.setTime(times);
        startDate = common.getMonthStartTime(date);
        endDate = common.getMonthEndTime(date1);
    }
    return {
        "startDate" : startDate,
        "endDate" : endDate
    };
}

//计算各个子应用的访问率
function calculateAccessRate(date, type) {
    var conn = mongoose.createConnection(global.mongodbURL);
    var analyLoginModel = conn.model("analy_login", analySchema.AnalyLoginSchema);
    var analySubappAccessLogModel = conn.model("analy_subapp_access_log", analySchema.AnalySubappAccessLogSchema);
    var analySubappAccessRateModel = conn.model("analy_subapp_access_rate", analySchema.AnalySubappAccessRateSchema);
    var startDate = date.startDate;
    var endDate = date.endDate;
    var startTimes = startDate.getTime();
    var endTimes = endDate.getTime();
    var startDateStr = common.date2str(startDate, "yyyy-MM-dd");
    var endDateStr = common.date2str(endDate, "yyyy-MM-dd");
	console.log(type,startDateStr,endDateStr);
    //总的登录次数
    analyLoginModel.count({
        "createTime" : {
            "$gte" : startTimes,
            "$lte" : endTimes
        }
    }, function(err, count) {
        var loginCount = count;
        //统计各个子应用的访问次数
        analySubappAccessLogModel.aggregate([{
            "$match" : {
                "createTime" : {
                    "$gte" : startTimes,
                    "$lte" : endTimes
                }
            }
        }, {
            "$group" : {
                "_id" : {
                    "appId" : "$appId",
                    "appName" : "$appName"
                },
                "count" : {
                    "$sum" : 1
                }
            }
        },{
			"$match":{
				"count":{
					"$gte":1
				}
			}
		}], function(err, data) {
            var subappTotalAccessCount = 0;
            //统计各个子应用的访问率
            var queue = async.queue(function(task, cb) {
                setTimeout(function() {
                    var times = Date.now();
                    var appId = task["_id"]["appId"];
                    var appName = task["_id"]["appName"];
                    var count = task["count"];
                    subappTotalAccessCount += count;
                    var accessRate = count / loginCount;
                    accessRate = common.forDight(accessRate, 4);
                    var analySubappAccessRate = new analySubappAccessRateModel({
                        "appId" : appId,
                        "appName" : appName,
                        "accessRate" : accessRate,
                        "accessRateType" : type,
						"accessCount":count,
                        "startTime" : startDateStr,
                        "endTime" : endDateStr,
                        "createTime" : times
                    });
                    analySubappAccessRate.save(function(err) {
                        cb(null, null);
                    });
                }, 5000);
            }, 50);
            queue.push(data);
            queue.drain = function() {
                //计算总的访问率
                var totalAccessRate = subappTotalAccessCount / loginCount;
                totalAccessRate = common.forDight(totalAccessRate, 4);
                var AnalySubappTotalAccessRateModel = conn.model("analy_subapp_total_access_rate", analySchema.AnalySubappTotalAccessRateSchema);
                var AnalySubappTotalAccessRate = new AnalySubappTotalAccessRateModel({
                    "accessRate" : totalAccessRate,
                    "accessRateType" : type,
					"accessCount":subappTotalAccessCount,
                    "startTime" : startDateStr,
                    "endTime" : endDateStr,
                    "createTime" : Date.now()
                });
                AnalySubappTotalAccessRate.save(function() {
                    conn.close();
					console.log("analy.analySubappAccessRate end");
                });
            }
        });
    });
}

exports.Runner = run;

