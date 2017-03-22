var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");
var async = require("async");

function run(Param, Robot, Request, Response, IF) {
    try {
        var arg = JSON.parse(Param.body.toString());
        var db = mongoose.createConnection(global.mongodbURL);
        var MeetBookModel = db.model("meetBook", sm.MeetBookSchema);
        var meetingRoomId = arg.meetingRoomId;
        var startTimes = parseInt(arg.startTime);
        var endTimes = parseInt(arg.endTime);
        Response.setHeader("Content-type","text/json;charset=utf-8");
        MeetBookModel.find({
            'meetRoom2' : meetingRoomId,
            'state' : {"$in":[3,4,5,6]},
            'startTime' : {
                '$lte' : endTimes
            },
            'endTime' : {
                '$gte' : startTimes
            }
        }, function(err, data) {
            db.close();
            if (!err) {
                Response.end(JSON.stringify({
                    status : '0',
                    msg : '查询成功',
                    data : data
                }));
            } else {
                Response.end(JSON.stringify({
                    status : '-1',
                    msg : '查询失败'
                }));
            }
        });
    } catch(e) {
        Response.end(JSON.stringify({
            status : '-1',
            msg : '查询失败'
        }));
    }
}

exports.Runner = run;

