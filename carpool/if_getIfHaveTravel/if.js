var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");

/**
 * 获取是否有开车记录，用于展示拼车首页信息
   作者：xialin
 * 时间：2016-01-20
   入参：arg.userId  :工号
   状态：待完成
 * 
*/
function run(Param, Robot, Request, Response, IF)
{
	console.log("--->getIfHaveTravel");
	var arg = JSON.parse(Param.body.toString());
	var userId =arg.userId;
	
	var pageNumber = parseInt(arg.pageNumber);
    var pageSize = parseInt(arg.pageSize);
    var skip = (pageNumber-1)*pageSize;
 
   
	var db = mongoose.createConnection(global.mongodbURL);
	var travelModel = db.model("carpoolTravel",sm.CarpoolTralvelSchema);
	
	var query = {startDate:{$gte:new Date().getTime()},userId:userId,state:0};
	
	
	travelModel.find(query).skip(skip).limit(pageSize)
	    .sort({startDate:1})
	    .exec(function(err,data){
        db.close();
        Response.setHeader("Content-type","text/json;charset=utf-8");
        if(!err){
            
            if(data.length >= 1){
                //有记录
                Response.end(JSON.stringify({
                status:"1",
                msg:"有行程记录",
				data:data
            }));
            }else{
                
                //无记录
                Response.end(JSON.stringify({
                status:"0",
                msg:"无行程记录"
                
            }));
                
            }
     
        }else{
            Response.end(JSON.stringify({
                status:"-1",
                msg:"查询失败"
            }));
        }
    });
	
	
	
	
}

exports.Runner = run;


                                

	

