var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");

/**
 * 验证二维码 --接口废弃 
 * @author wangdonghua
 * @version 2014年12月26日16:35
 * 
 * 
 * */
function run(Param, Robot, Request, Response, IF)
{
	var arg = JSON.parse(Param.body.toString());
	var encodeStr = arg.twoDimensionalCode;
	encodeStr = encodeStr.substr(9);
	var twoDimensionalCode = new Buffer(encodeStr, 'base64').toString();
	var driverId1 = arg.driverId;
	var arr = twoDimensionalCode.split(",");
	if(arr.length != 3){
	    Response.end(JSON.stringify({
                        status : "-1",
                        msg : "验证失败"
                    }));
        return;
	}
	var serialNumber = arr[0];
	var driverId = arr[1];
	var passengerId = arr[2];
	if(driverId1 != driverId){
	    Response.end(JSON.stringify({
                        status : "-1",
                        msg : "验证失败"
                    }));
        return;
	}
	
    var db = mongoose.createConnection(global.mongodbURL);
    var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
    travelModel.count({travelSerialNumber:serialNumber,state:0,userId:{$in:[driverId,passengerId]}},function(err,count){
        Response.setHeader("Content-type","text/json;charset=utf-8");
        if(!err && count == 2){
            travelModel.findOne({userId:driverId,userType:1,travelSerialNumber:serialNumber},function(err,doc){
                db.close();
                updateTravelState(serialNumber,passengerId);
                Response.end(JSON.stringify({
                        status : "0",
                        msg : "验证成功",
                        passengerId:passengerId,
                        driverId:driverId,
                        travleId:doc._id
                    }));
            });
        }else{
             db.close();
            Response.end(JSON.stringify({
                        status : "-1",
                        msg : "验证失败"
                    }));
        }
    });
}

//更新二维码状态
function updateTravelState(serialNumber,passengerId){
    var db = mongoose.createConnection(global.mongodbURL);
    var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
    travelModel.update({userId:passengerId,travelSerialNumber:serialNumber,state:0},{validateState:1},function(err){
        db.close();
    });
}

exports.Runner = run;


                                

	

