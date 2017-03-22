var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");
var async = require("async");
/**
 * 停用会议室（董元）
 */
function run(Param, Robot, Request, Response, IF)
{
	
	var arg=JSON.parse(Param.body.toString());
	var db=mongoose.createConnection(global.mongodbURL);
	var MeetRoomModel=db.model("meetRoom",sm.MeetRoomSchema);
    MeetRoomModel.update({_id:arg.roomId},{
		state:parseInt(arg.state)
     },function(err,data){
         db.close();
         Response.setHeader("Content-type","text/json;charset=utf-8");
         if(!err){
             Response.end(JSON.stringify({
                 status:0,
                 msg:"停用成功"
             }));
         }else{
		 	console.log(err);
             Response.end(JSON.stringify({
                 status:-1,
                 msg:"停用失败"
             }));
         }
     });
}

exports.Runner = run;


                                

	

