var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");

var moment = require('moment');

/**
 * 我是乘客- 搜索行程：司机的确定行程，不确定行程    按地区出发时间（具体到天）
 * @author xialin
 * @version 2016年04月08日
 * 完成
 * */
function run(Param, Robot, Request, Response, IF)
{
     var arg = JSON.parse(Param.body.toString());
    var pageNumber = parseInt(arg.pageNumber);
    var pageSize = parseInt(arg.pageSize); 
    var skipNumber = (pageNumber - 1)*pageSize;
    var startAddress =new RegExp(arg.startAddress);  //出发地
    var arriveAddress =new RegExp(arg.arriveAddress); //目的地
   
    
    var  startDate =parseInt(arg.startDate);  //传入搜索日期
    var endDate =startDate+ (24*60*60*1000);
    
    
    var db = mongoose.createConnection(global.mongodbURL);
    var travelModel = db.model("carpoolTravel",sm.CarpoolTralvelSchema);
    var carModel = db.model("carpoolCar",sm.CarpoolCarSchema);
    
    travelModel.find({"$or":[{startDate:{$gte:startDate,$lte:endDate},startAddress:startAddress,arriveAddress:arriveAddress,carpoolType:1,userType:1,state:0}
                            ,{setCloseTime:{$gte:startDate},startDate:{$gte:startDate,$lte:endDate},carpoolType:2,userType:1,state:0}]}).populate("car")
                            .skip(skipNumber).limit(pageSize).sort({startDate:1})
                            .exec(function(err,data){
        db.close();
        Response.setHeader("Content-type","text/json;charset=utf-8");
        if(!err){
            Response.end(JSON.stringify({
                status:"0",
                msg:"查询成功",
                msgStatus:"S4000105",
                data:data
            }));
        }else{
            Response.end(JSON.stringify({
                status:"-1",
                msgStatus:"E4000105",
                msg:"查询失败"
            }));
        }
    });


}

exports.Runner = run;


                                

    

