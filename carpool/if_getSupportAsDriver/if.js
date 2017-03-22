var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");

/**
 * 查询开车的赞
 * @author wangdonghua
 * @version 2014年12月27日16:59
 * */

function run(Param, Robot, Request, Response, IF)
{
	var arg = JSON.parse(Param.body.toString());
	var userId = arg.userId;
	var pageNumber = parseInt(arg.pageNumber);
	var pageSize = parseInt(arg.pageSize);
	var skip = (pageNumber - 1) * pageSize;
	
	var db = mongoose.createConnection(global.mongodbURL);
	var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
	var evaluateModel = db.model("carpoolEvaluate",sm.CarpoolEvaluateSchema);
    var query = {evaluaterType:2,userId2:userId};
    evaluateModel.find(query).populate("travel").skip(skip).limit(pageSize).sort({createdAt:-1}).exec(function(err,data){
        Response.setHeader("Content-type","text/json;charset=utf-8");
        db.close();
        if(!err){
            Response.end(JSON.stringify({
                status:"0",
                msg:"查询成功",
                data:data
            }));
        }else{
            Response.end(JSON.stringify({
                status:"-1",
                msg:"查询失败",
            }));
        }
    });
}

exports.Runner = run;
