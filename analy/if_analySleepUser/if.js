var MEAP = require("meap");
var mongoose = require("mongoose");
var mongoClient = require("mongodb").MongoClient;
var async = require("async");
var analySchema = require("../AnalySchema.js");
var common = require("../common.js");

/**
 * 分析睡眠用户
 * @author donghua.wang
 * @date 2016年3月16日 10:57
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("analy.analySleepUser start");
    var headers = Request.headers;
    var host = headers.host;
    if (host.indexOf("localhost") == -1) {
        Response.end("not auth");
        return;
    }
    Response.end("start analy sleep user ");

    var sleepTimes = 86400 * 30 * 1000;
    var conn = mongoose.createConnection(global.mongodbURL);
    var analyLoginModel = conn.model("analy_login", analySchema.AnalyLoginSchema);
    analyLoginModel.aggregate([{
        "$group" : {
            "_id" : "$userId",
            "lastLoginTime" : {
                "$max" : "$createTime"
            }
        }
    }], function(err, docs) {
        var times = Date.now();
        var sleepUsers = [];
        var sleepUserIds = [];
        for (var i in docs) {
            var doc = docs[i];
            var userId = doc._id;
            var lastLoginTime = doc.lastLoginTime;
            if (times - lastLoginTime > sleepTimes) {
                sleepUsers.push({
                    "userId" : userId,
                    "lastLoginTime" : lastLoginTime
                });
                var tmp = "";
                if (userId.length == 7) {
                    tmp = "0" + userId
                } else {
                    tmp = userId
                }
                sleepUserIds.push(tmp);
            }
        }
        if (sleepUsers.length == 0) {//没有睡眠用户
            conn.close();
            console.log("no sleep user");
            console.log("analy.analySleepUser end");
        } else {
            mongoClient.connect(global.mongodbURL, function(err, db) {
                var coll = db.collection("base_users");
                coll.find({
                    "PERNR" : {
                        "$in" : sleepUserIds
                    }
                }).toArray(function(err, users) {
                    db.close();
                    getUserName(sleepUsers, users);
                    var analySleepUserModel = conn.model("analy_sleep_user", analySchema.AnalySleepUserSchema);
                    //删除原来的睡眠用户
                    analySleepUserModel.remove({}, function(err) {
						//添加睡眠用户
                        var queue = async.queue(function(task, cb) {
                            setTimeout(function() {
                                var userId = task.userId;
                                var userName = task.userName;
                                var sleepStartTime = task.lastLoginTime;
                                var date = new Date();
                                date.setTime(sleepStartTime);
                                var sleepStartTimeStr = common.date2str(date, "yyyy-MM-dd hh:mm:ss");
                                var analyUser = new analySleepUserModel({
                                    "userId" : userId,
                                    "userName" : userName,
                                    "sleepStartTime" : sleepStartTime,
                                    "sleepStartTimeStr" : sleepStartTimeStr,
                                    "createTime" : times
                                });
								analyUser.save(function(err){
									cb(null,null);
								});
                            }, 5000);
                        }, 100);
                        queue.push(sleepUsers);
                        queue.drain = function() {
                            conn.close();
                            console.log("analy sleep user end");
                        }
                    })
                });
            });
        }
    });
}

//得到用户的名字
function getUserName(sleepUsers, users) {
    for (var i in sleepUsers) {
        var sleepUser = sleepUsers[i];
        var userId1 = sleepUser.userId;
        if (userId1.length == 7) {
            userId1 = "0" + userId1;
        }
        for (var j in users) {
            var user = users[j];
            var userIds2 = user.PERNR;
            var userName = user.NACHN;
            if (userId1 == userIds2) {
                sleepUser.userName = userName;
                break;
            }
        }
    }
}

exports.Runner = run;

