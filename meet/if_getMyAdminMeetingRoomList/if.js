var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");
var util=require("../util.js");

function run(Param, Robot, Request, Response, IF)
{
	try{
	    var arg=JSON.parse(Param.body.toString());
	    var meetingRoomId = arg.meetingRoomId;
	    var userId = arg.userId;
        var db=mongoose.createConnection(global.mongodbURL);
        var MeetRoomModel=db.model("meetRoom",sm.MeetRoomSchema);
        Response.setHeader("Content-type","text/json;charset=utf-8");
        MeetRoomModel.find({'admin.userId':userId,'state':{'$in':[1,2]}},function(err,data){
            db.close();
            if(!err){
                Response.end(JSON.stringify({
                    status:"0",
                    msg:"查询成功",
                    data:data
                }));
            }else{
                console.log("err--->" + err);
                Response.end(JSON.stringify({
                    status:"-1",
                    msg:"查询失败"
                }));
            }
        });
        
	}catch(e){
	    console.log("e--->" + e);
	    Response.end(JSON.stringify({
	        status:"-1",
	        msg:"查询失败"
	    }));
	}
}

exports.Runner = run;


                                

	

