var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");

function run(Param, Robot, Request, Response, IF)
{
    var arg=JSON.parse(Param.body.toString());
    var db=mongoose.createConnection(global.mongodbURL);
    var MeetRoomModel=db.model("meetRoom",sm.MeetRoomSchema);
    Response.setHeader("Content-type","text/json;charset=utf-8");
    MeetRoomModel.find({meetRoom:arg.roomId,endTime:{$lt:arg.endTime},startTime:{$gt:arg.startTime}},function(err,data){
        db.close();
        if(!err){
            Response.end(JSON.stringify({
                status:0,
                msg:"查询成功",
                data:data
            }));
        }else{
             Response.end(JSON.stringify({
                status:-1,
                msg:"查询失败"
            }));
        }
    });
}

exports.Runner = run;


                                

    

