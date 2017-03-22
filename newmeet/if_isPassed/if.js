var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");

function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var meetingRoomId = arg.meetingRoomId;
    var startTime = arg.startTime;
    var endTime =arg.endTime;
    var db = mongoose.createConnection(global.mongodbURL);
    var meetBookModel = db.model('meetbook', sm.MeetBookSchema);
    meetBookModel.findOne({
        meetRoom2 : meetingRoomId,
        state : {"$in":[2,5]},
        startTime : {
            $lt : endTime
        },
        endTime : {
            $gt : startTime
        }
    }, function(err, data) {
        db.close();
        var rs = null;
        if(!err){
            if(data != null){
                rs = {status:"0",msg:"该会议室已经被预定",code:"1"};
            }else{
                rs = {status:"0",msg:"该会议室未被预定",code:"0"};
            }
        }else{
            rs = {status:"-1",msg:"查询失败"};
        }
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        Response.end(JSON.stringify(rs));
    });
}

exports.Runner = run;

