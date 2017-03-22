var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");

/**
 * 查询开车或搭车记录  （司机和乘客）  注意这里为了能够正常使用，1.可以将数据库所以字段加上cttq，2.不用company进行判断
                                                                  推荐使用修改数据库的方法
 * @author xialin
 * @version 2016年1月18日16:28
   状态：已完成
    入参：arg.userId
	      arg.type  ：用户类型  1司机  2乘客    //待保留：3伪司机 4转拼车用户 
		  arg.carpoolType   1:拼车  2：约车
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
	var company =arg.company;
	var carpoolType=parseInt(arg.carpoolType);
    var pageNumber = parseInt(arg.pageNumber);
    var pageSize = parseInt(arg.pageSize);
    var skip = (pageNumber-1)*pageSize;
 
    var query = {userId:userId,company:company,userType:userType,carpoolType:carpoolType};
    var query2 ={startProvince:-1,arriveProvince:-1,startCity:-1,startAddress:-1,arriveCity:-1,arriveAddress:-1,startDate:-1,travelSerialNumber:-1,state:-1};
   
    travelModel.find(query,query2).skip(skip).limit(pageSize).sort({createdAt:-1}).exec(function(err,data){
       
      
        Response.setHeader("Content-type","text/json;charset=utf-8");
        db.close();
        if(!err){

            Response.end(JSON.stringify({
                status:"0",
                msg:"查询成功",
				msgStatus:"",
                data:data
            }));
        }else{
           Response.end(JSON.stringify({
                status:"-1",
				msgStatus:"",
                msg:"查询失败"
            })); 
        }
    });
}

exports.Runner = run;


                                

	

