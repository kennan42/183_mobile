var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../BaseSchema.js");

//查询消息推送记录
function run(Param, Robot, Request, Response, IF)
{
	var arg = JSON.parse(Param.body.toString());
    var pageSize = parseInt(arg.pageSize);
    var condition = {userId:arg.userId,appId:arg.appId};
    if(arg.maxTims){
        condition.pushTime = {"$lte":parseInt(arg.maxTims)};
    }
    if(arg.readStatus){
        condition.readStatus = parseInt(arg.readStatus);
    }
    var db = mongoose.createConnection(global.mongodbURL);
    var pusuMessageLogModel = db.model("basePushMessageLog",sm.BasePushMessageLogSchema);
    pusuMessageLogModel.find(condition).limit(pageSize).sort({pushTime:-1}).exec(function(err,data){
        db.close();
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if(!err){
            Response.end(JSON.stringify({
                status:"0",
                msg:"查询成功",
                data:data
            }));
        }else{
             Response.end(JSON.stringify({
                status:"-1",
                msg:"查询失败"
            }));
        }
    });;
    
}

exports.Runner = run;


                                

	

