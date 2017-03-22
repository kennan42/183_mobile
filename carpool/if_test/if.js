var MEAP = require("meap");
var REDIS = require("meap_redis");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");
function run(Param, Robot, Request, Response, IF) {
    console.log("carpool test");
    Response.end("over");
}

function pushMsgDelay(travelId) {
    console.log("------------------->pushMsgDelay");
    setTimeout(function() {
        //推送消息用户
        var userIds = null;
        //本次行程的用户
        var travelUserIds = [];
        var userIdsStr = null;
        var serialNumber = null;
        var travelObject = null;
        async.series([
        //查询行程
        function(callback) {
            var db = mongoose.createConnection(global.mongodbURL);
            var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
            var times = new Date().getTime();
            travelModel.findById(travelId, function(err, data) {
                db.close();
                console.log("times--->",times);
                console.log("travel--->",data);
                if (true) {
                    serialNumber = data.travelSerialNumber;
                    travelObject = data;
                    callback(err, "");
                } else {
                    return;
                }
            });
        },
        //查询本次行程的用户（乘客，司机，被踢的人）
        function(callback){
            var db = mongoose.createConnection(global.mongodbURL);
            var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
            var query = travelModel.find({"state":{"$in":[0,1]},"travelSerialNumber":serialNumber},{_id:0,userId:1});
            query.exec(function(err,data){
                db.close();
                for(var i in data){
                     travelUserIds.push(data[i].userId);
                }
                console.log("travelUserIds--->",travelUserIds);
                userIdsStr = travelUserIds.join(",");
                console.log("userIdsStr--->",userIdsStr);
                callback(err,"");
            });
        },
        //查询推送用户
        function(callback) {
            var option = {
                CN : "Dsn=mysql-emm",
                sql : "select distinct(userId) from BindUser where appId = '" +  
                        global.appId + "'" + " and userId not in (" + userIdsStr + ")"
            };
            console.log("sql--->",option.sql);
            MEAP.ODBC.Runner(option, function(err, rows, cols) {
                console.log("----------------",rows.length);
                if (!err) {
                    userIds = rows;
                    callback(err, null);
                } else {
                    return;
                }
            });
        }], function(err, data) {
                console.log("broadcast carpool info over");
        });
    }, 30);
}

exports.Runner = run;

