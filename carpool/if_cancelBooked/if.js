var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");
var util = require("../../base/util.js");
var jpushUtil = require("../../jpush2/jpush_util.js");

/**
 * 乘客-取消拼车行程或不确定行程
 * @author xialin
 * @version 2016年04月08日11:01
   状态：未完成  
 * */
var db = null;
var arg = null;
var travelObj = null;
function run(Param, Robot, Request, Response, IF)
{
	arg = JSON.parse(Param.body.toString());  
	db = mongoose.createConnection(global.mongodbURL);
    main(Response);
}

function main(Response){
    async.series([getTravelById,cancalBooked,updateSeatCount,addCancelTravelDocument],function(err,data){
        Response.setHeader("Content-type","text/json;charset=utf-8");
        db.close();
        if(!err){
            Response.end(JSON.stringify({
                status:"0",
                msg:"取消预约成功",
				msgStatus:"S4000115"
            }));
        }else{
            Response.end(JSON.stringify({
                status:"-1",
                msg:"取消预约失败",
				msgStatus:"S4000127"
            }));
        }
    });
}

//取消预约
function cancalBooked(callback){
    var travelId = arg.travelId;
    var travelModel = db.model("carpoolTravel",sm.CarpoolTralvelSchema);
    travelModel.update({_id:travelId},{state:3},function(err,data){
        //push msg to driver
        if(!err){
            var travel = arg.travel;
            travelModel.findById(travel,function(err,doc){
                if(!err){
					var userIds = [];
					userIds.push(doc.userId);
						
					//推送给司机的 
					//
					var content ="";  
                     
			        
                    if(arg.carpoolType==2){
						if(travelObj.startCityCode==travelObj.arriveCityCode){
					    content ="您" + util.getMMddHHmmFromTimes(travelObj.startDate) + "从" + travelObj.startAddress +  "到" 
                                + travelObj.arriveAddress + "的不确定行程中" + arg.userName + "取消预约了，可以继续邀请其他同事哦。";
					    }else{
						content ="您" + util.getMMddHHmmFromTimes(travelObj.startDate) + "从" + travelObj.startCity +  "到" 
                                + travelObj.arriveCity + "的不确定行程中" + arg.userName + "取消预约了，可以继续邀请其他同事哦。";
					    } 
					}else{
						if(travelObj.startCityCode==travelObj.arriveCityCode){
					    content ="您" + util.getMMddHHmmFromTimes(travelObj.startDate) + "从" + travelObj.startAddress +  "到" 
                                 + travelObj.arriveAddress + "的行程中" + arg.userName + "取消预约了，可以继续邀请其他同事哦。";
					    }else{
						content ="您" + util.getMMddHHmmFromTimes(travelObj.startDate) + "从" + travelObj.startCity +  "到" 
                                 + travelObj.arriveCity + "的行程中" + arg.userName + "取消预约了，可以继续邀请其他同事哦。";
					    } 
						
					}
 
				   var jpushArg = {
					   userid:arg.userId,
					   userList:userIds,
					   title:"",
					   content:content,
					   type:0,
					   msgType:"Carpool",
                       subModule:"CarpoolDriver"
				   };
				  
						jpushUtil.jpush(jpushArg);
					
                }
             callback(err,doc);
            });
        }else{
             callback(-1,data);
        }
       
    });
}

//更新座位数
function updateSeatCount(callback){
    var travelId = arg.travel;
    var travelModel = db.model("carpoolTravel",sm.CarpoolTralvelSchema);
    travelModel.update({_id:travelId},{$inc:{bookedSeatCount:-1}},function(err,data){
        callback(err,data);
    });
}

//添加取消预约记录
function addCancelTravelDocument(callback){
    var travelId = arg.travel;
    var userId = arg.userId;
    var userName = arg.userName;
	var company =arg.company;
   // var reason = arg.reason;
    
    var cancelTravelModel = db.model("carpoolCancelTravel",sm.CarpoolCancelTravelSchema);
    var calcenTravelEntity = new cancelTravelModel({
        travel:travelId,
        userId:userId,
        userName:userName,
		company:company,
        type:2,
       // reason:reason,
        createdAt:new Date().getTime()
    });
    calcenTravelEntity.save(function(err,data){
        callback(err,data);
    });
}

//查询行程信息
function getTravelById(callback){
   var travelId = arg.travel;
   var travelModel = db.model("carpoolTravel",sm.CarpoolTralvelSchema);
   travelModel.findById(travelId,function(err,data){
       travelObj = data;
       callback(err,"");
   });
}

exports.Runner = run;
