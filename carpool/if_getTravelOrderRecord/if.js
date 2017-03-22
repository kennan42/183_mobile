var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");

/**
 * 查询约车记录
 * @author xialin
 * @version 2016年1月18日16:28
   状态：已完成
   入参： arg.userId
          arg.type  ：用户类型  1司机  2乘客 3伪司机 4转拼车用户
		  arg.pageNumber
		  arg.pageSize
		  
 * */

function run(Param, Robot, Request, Response, IF)
{
    var arg = JSON.parse(Param.body.toString());
    var db = mongoose.createConnection(global.mongodbURL);
    var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
    var userId = arg.userId;
    var userType = parseInt(arg.type);
    var pageNumber = parseInt(arg.pageNumber);
    var pageSize = parseInt(arg.pageSize);
    var skip = (pageNumber-1)*pageSize;
 
    var query = {userId:userId,userType:userType};
    
   
    travelModel.find(query).skip(skip).limit(pageSize).sort({createdAt:-1}).exec(function(err,data){
       
      
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
                msg:"查询失败"
            })); 
        }
    });
}

exports.Runner = run;
