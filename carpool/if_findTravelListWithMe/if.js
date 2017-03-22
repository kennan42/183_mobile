var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");

/**
 * 司机-查找我的记录
 * 这里注意。我的记录包括不确定行程和确定行程
 * 1.确定行程可以大于当前出发时间
 * 2.不确定行程 如果超过截止时间那么变成 取消的不再显示 ，如果达到条件时，变成确定行程单 
 * @author xialin
 * @version 20160401
 * */
function run(Param, Robot, Request, Response, IF)
{
    var arg = JSON.parse(Param.body.toString());
    var pageNumber = parseInt(arg.pageNumber);
    var pageSize = parseInt(arg.pageSize); 
    var skipNumber = (pageNumber - 1)*pageSize;
    
    var company=arg.company; //公司
    var userId =arg.userId; //员工ID
    var db = mongoose.createConnection(global.mongodbURL);
    var travelModel = db.model("carpoolTravel",sm.CarpoolTralvelSchema);
    var carModel = db.model("carpoolCar",sm.CarpoolCarSchema);
    
    travelModel.find({"$or":[{startDate:{$gte:new Date().getTime()},company:company,userId:userId,carpoolType:1,userType:1,state:0}
                            ,{setCloseTime:{$gte:new Date().getTime()},company:company,userId:userId,carpoolType:2,userType:1,state:0}]}).populate("car")
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


                                

    

