var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");
var async = require("async");


/**
 * 3.6删除会议室（董元）
 * 参照”3.5停用会议室”
 */
function run(Param, Robot, Request, Response, IF)
{
	
	//var arg =  {roomId:"54d81cd3f23749e406f5cc54"};
	var arg=JSON.parse(Param.body.toString());
	var db=mongoose.createConnection(global.mongodbURL);
	var MeetRoomModel=db.model("meetRoom",sm.MeetRoomSchema);
    MeetRoomModel.update({_id:arg.roomId},{
		 state:3//1正常   2冻结   3删除  4停用
     },function(err,data){
         db.close();
         Response.setHeader("Content-type","text/json;charset=utf-8");
         if(!err){
             Response.end(JSON.stringify({
                 status:0,
                 msg:"删除成功"
             }));
         }else{
		 	console.log(err);
             Response.end(JSON.stringify({
                 status:-1,
                 msg:"删除失败"
             }));
         }
     });
}

exports.Runner = run;


                                

	

