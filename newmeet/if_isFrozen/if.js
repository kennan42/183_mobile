var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var meetSchema = require("../meetSchema.js");

function run(Param, Robot, Request, Response, IF)
{
    var arg = JSON.parse(Param.body.toString());
    var meetRoomId = arg.meetRoomId;
    var startTime = arg.startTime;
    var endTime = arg.endTime;
    var db = mongoose.createConnection(global.mongodbURL);
    var MeetRoomModel = db.model("meetRoom", meetSchema.MeetRoomSchema);
    MeetRoomModel.findOne({_id:meetRoomId,state:2,frozenBegin:{$lte:endTime},frozenEnd:{$gte:startTime}},function(err,data){
        db.close();
        Response.setHeader("Content-type","text/json;charset=utf-8");
        var rs = null;
       if(!err && data != null){
           rs = {
               status:"0",
               msg:"该会议室在申请时间内已经被冻结",
               isFrozen:"1"
           };
       }else{
           rs = {
               status:"0",
               msg:"该会议室未被冻结",
               isFrozen:"0"
           };
       }
       Response.end(JSON.stringify(rs));
    });
}

exports.Runner = run;


                                

	

