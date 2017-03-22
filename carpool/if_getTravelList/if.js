var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");

/**
 * 查询拼车行程列表 （我是司机）  carpoolType 1：拼车  2：约车
 * @author xialin
 * @version 2015年04月06日
 * */
function run(Param, Robot, Request, Response, IF)
{
	var arg = JSON.parse(Param.body.toString());
	var pageNumber = parseInt(arg.pageNumber);
	var pageSize = parseInt(arg.pageSize);
	var skipNumber = (pageNumber - 1)*pageSize;
	
	var carpoolType =arg.carpoolType;
	
	
	
	var db = mongoose.createConnection(global.mongodbURL);
	var travelModel = db.model("carpoolTravel",sm.CarpoolTralvelSchema);
	var carModel = db.model("carpoolCar",sm.CarpoolCarSchema);
	travelModel.find({startDate:{$gte:new Date().getTime()},carpoolType:carpoolType,userType:1,state:0}).populate("car")
	.skip(skipNumber).limit(pageSize).sort({startDate:1})
	.exec(function(err,data){
	    db.close();
	    Response.setHeader("Content-type","text/json;charset=utf-8");
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
	});

}

exports.Runner = run;


                                

	

