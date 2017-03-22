var MEAP = require("meap");
var mongoose = require("mongoose");
var async = require("async");
var baseSchema = require("../BaseSchema.js");

function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var db = mongoose.createConnection(global.mongodbURL);
    var basePushMessageLogModel = db.model("basePushMessageLog", baseSchema.BasePushMessageLogSchema);
    var rs = {};
    async.parallel([
    //查询拼车模块是否有未读消息
    function(callback) {
        basePushMessageLogModel.findOne({
            "userId" : userId,
            "module" : "Carpool",
            "readStatus" : 0
        }, function(err, data) {
            if (data != null) {
                rs.carpool = 1;
            } else {
                rs.carpool = 0;
            }
            callback(err, "");

        });
    },
    //查询会议室预定模块是否有未读信息
    function(callback) {
        var arr = ["FrozenMeetingRoom", "OutMeetingRoom", "CancelMeetingRoom", "ChangeMeetingRoom", "OffMeetingRoom"];
        basePushMessageLogModel.findOne({
            "userId" : userId,
            "readStatus" : 0,
            "subModule" : {
            "$in" : arr
            }
        }, function(err, data) {
            if (data != null) {
                rs.meet = 1;
            } else {
                rs.meet = 0;
            }
            callback(err, "");

        });
    }], function(err, data) {
        db.close();
        Response.setHeader("Content-Tpe","text/json;charset=utf-8");
        if (!err) {
            Response.end(JSON.stringify({
                "status" : "0",
                "msg" : "查询成功",
                "data" : rs
            }));
        } else {
            Response.end(JSON.stringify({
                "status" : "-1",
                "msg" : "查询失败"
            }));
        }
    });

}

exports.Runner = run;

