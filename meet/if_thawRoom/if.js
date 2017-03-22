var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");
var baseSchema = require("../../base/BaseSchema.js");

function run(Param, Robot, Request, Response, IF)
{
	var arg=JSON.parse(Param.body.toString());
	var db=mongoose.createConnection(global.mongodbURL);
    var MeetRoomModel=db.model("meetRoom",sm.MeetRoomSchema);
	MeetRoomModel.update({_id:arg.roomId},{$set:{state:1}},function(err,data){
	    db.close();
	    Response.setHeader("Content-type","text/json;charset=utf-8");
	    if(!err){
	        Response.end(JSON.stringify({
	            status:0,
	            msg:"解冻成功"
	        }));
	        addLog(arg);
	    }else{
	        Response.end(JSON.stringify({
	            status:-1,
	            msg:"解冻失败"
	        }));
	    }
	});
}

function addLog(arg){
    var db = mongoose.createConnection(global.mongodbURL);
    var logModel = db.model("meetRoom",baseSchema.BaseOpLogSchema);
    var logEntity = new logModel({
        opType:"u",
        opArg:arg,
        opDocument:"meetRoom",
        userId:arg.userId,
        userName:arg.userName,
        updateTime:util.getDateStrFromTimes(new Date().getTime(),true)
    });
    logEntity.save(function(err){
        db.close();
    });
}

exports.Runner = run;


                                

	

