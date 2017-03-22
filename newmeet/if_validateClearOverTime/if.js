var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");

function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var startTime = parseInt(arg.startTime);
    var endTime = parseInt(arg.endTime);
    var meetingRoomId = arg.meetingRoomId;
    var db = mongoose.createConnection(global.mongodbURL);
    var meetBookModel = db.model("meetBook", sm.MeetBookSchema);
    meetBookModel.findOne({
        meetRoom2 : meetingRoomId,
        state:2,
        endTime : {
            $lte : startTime
        },
        clearOverTime : {
            $gte : startTime
        }
    }, function(err, data) {
        db.close();
         Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err && data != null) {
            Response.end(JSON.stringify({
                status : "-1",
                msg : "你的会议时间与清场时间冲突"
            }));
        } else {
            Response.end(JSON.stringify({
                status : "0",
                msg : "不冲突"
            }));
        }
    });
}

exports.Runner = run;

