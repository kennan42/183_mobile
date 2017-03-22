var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");

/**
 * 作为乘客，查看搭车详情
 * */
var arg = null;
var db = null;
function run(Param, Robot, Request, Response, IF)
{
    arg = JSON.parse(Param.body.toString());
    db = mongoose.createConnection(global.mongodbURL);
	main(Response);
}

function main(Response){
    async.parallel([getTravelDetail,getSupports,getTwoDimensionalCode],function(err,data){
         Response.setHeader("Content-type", "text/json;charset=utf-8");
         db.close();
         if(!err){
             Response.end(JSON.stringify({
                 status:"0",
                 msg:"查询成功",
                 travle:data[0],
                 isSupported:data[1],
                 twoDimensionalCode:data[2].twoDimensionalCode
             }));
         }else{
             Response.end(JSON.stringify({
                 status:"-1",
                 msg:"查询失败"
             }));
         }
    });
}

//查询行程详情
function getTravelDetail(callback){
    var travelId = arg.travelId;
    var carModel = db.model("carpoolCar",sm.CarpoolCarSchema);
    var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
    travelModel.findOne({_id:travelId}).populate("car").exec(function(err,data){
        callback(err,data);
    });
}

//查询行程的点赞记录
function getSupports(callback){
    var travelId = arg.travelId;
    var userId = arg.userId;
    var evaluateModel = db.model("carpoolEvaluate",sm.CarpoolEvaluateSchema);
    evaluateModel.findOne({userId:userId,travel:travelId},function(err,data){
         callback(err,data);
    });
}

//查询二维码
function getTwoDimensionalCode(callback){
    var travelId = arg.travelId;
    var userId = arg.userId;
    var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
    travelModel.findOne({userId:userId,travel:travelId},function(err,data){
        callback(err,data);
    })
    
}
exports.Runner = run;


                                

	

