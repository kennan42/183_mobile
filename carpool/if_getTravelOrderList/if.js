var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");

/**
 * 查询约车行程列表,约车且是约车发布者
 * @author xialin
 * @version 2015年12月28日
   状态：已完成
   入参：arg.pageNumber
         arg.pageSize   
   
   
 * */
function run(Param, Robot, Request, Response, IF)
{
    var arg = JSON.parse(Param.body.toString());
    var pageNumber = parseInt(arg.pageNumber);
    var pageSize = parseInt(arg.pageSize);
    var skipNumber = (pageNumber - 1)*pageSize;
    
    var db = mongoose.createConnection(global.mongodbURL);
  
   var travelModel = db.model("carpoolTravel",sm.CarpoolTralvelSchema);
    travelModel.find({startDate:{$gte:new Date().getTime()},userType:1,carpoolType:2})
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


                                

    

