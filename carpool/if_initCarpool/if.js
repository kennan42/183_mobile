var MEAP = require("meap");
var REDIS = require("meap_redis");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");

var res = null;
var db = null;
var travelModel = null;
var carModel = null;

/**
 * 初始拼车：查询拼车数量
 * @author xialin
 * @version 2016年1月18日16:28
   状态：已完成
   入参： 
		  
 * */


function run(Param, Robot, Request, Response, IF) {
    res = Response;
    async.series([getInitInfoFromRedis, getInitInfoFromMongoDB], function(err, data) {
    });
}

function getInitInfoFromRedis(callback) {
    console.log("--->getInitInfoFromRedis");
    var Client = REDIS.createClient(global.redisPort, global.emmRedisHost);
    console.log("redis--->",Client);
    Client.on("ready", function() {
        Client.select(1, function() {
            Client.GET("carpoolInitInfo", function(err, data) {
                Client.quit();
                if (!err && data != null) {
                    var value = JSON.parse(data);
                    res.setHeader("Content-type", "text/json;charset=utf-8");
                    res.end(JSON.stringify({
                        status : "0",
                        msg : "查询成功",
                        publishedTravelCount : value.publishedTravelCount,
                        carCount : value.carCount,
                        bookedTravelCount : value.bookedTravelCount
                    }));
                    return;
                } else {
                    callback(0, '');
                }
            });
        });
    });
}

function getInitInfoFromMongoDB(callback) {
    console.log("--->getInitInfoFromMongoDB");
    db = mongoose.createConnection(global.mongodbURL);
    travelModel = db.model("carpoolTravel",sm.CarpoolTralvelSchema);
    carModel = db.model("carpoolCar",sm.CarpoolCarSchema);
    async.parallel([getPublishedTravelCount, getCarCount, getBookedTravelCount], function(err, data) {
        db.close();
        res.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err) {
            saveInitInfoToRedis(data);
            res.end(JSON.stringify({
                status : "0",
                msg : "查询成功",
                publishedTravelCount : data[0],
                carCount : data[1],
                bookedTravelCount : data[2]
            }));
            return;
        } else {
            res.end(JSON.stringify({
                status : "-1",
                msg : "查询失败"
            }));
            return;
        }
    });
}

function getPublishedTravelCount(cb) {
    console.log("--->getPublishedTravelCount");
    travelModel.count({
        userType : 1
    }, function(err, data) {
        cb(err, data);
    });
}

function getCarCount(cb) {
    console.log("--->getCarCount");
    carModel.count({
        state : 1
    }, function(err, data) {
        cb(err, data);
    });
}

function getBookedTravelCount(cb) {
    console.log("--->getBookedTravelCount");
    travelModel.count({
        userType : 2
    }, function(err, data) {
        cb(err, data);
    });
}

function saveInitInfoToRedis(data) {
    console.log("--->saveInitInfoToRedis");
    var Client = REDIS.createClient(global.redisPort, global.redisHost);
    var value = JSON.stringify({
        publishedTravelCount : data[0],
        carCount : data[1],
        bookedTravelCount : data[2]
    });

    Client.on("ready", function() {
        Client.select(1, function() {
            Client.SETEX ("carpoolInitInfo",600, value, function(err) {
                Client.quit();
            });
        });
    });
}

exports.Runner = run;

