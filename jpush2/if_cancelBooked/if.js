var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");
var util = require("../../base/util.js");
var jpushUtil = require("../../jpush2/jpush_util.js");

/**
 * 取消预约
 * @author wangdonghua
 * @version 2014年12月26日15:38
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
                msg:"取消预约成功"
            }));
        }else{
            Response.end(JSON.stringify({
                status:"-1",
                msg:"取消预约失败"
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
                    var pushArg = {
                          appId:global.appId,
                          platforms:"0,1",
                          title:"您" + util.getMMddHHmmFromTimes(travelObj.startDate) + "从" + travelObj.startCity +  "到" 
                                + travelObj.arriveCity + "的行程中" + arg.userName + "取消预约了，可以继续邀请其他同事哦。",
                          body:new Date().getTime() + "_CarpoolBookCancel",
                          userIds:userIds,
                          badgeNum:3,
                          module:"Carpool",
                          subModule:"CarpoolBookCancel",
                          type:"remind"
                    };
                   // util.pushMsg(pushArg);
				   var jpushArg = {
					   userid:arg.userId,
					   userList:userIds,
					   title:"",
					   content:pushArg.title,
					   type:0
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
   // var reason = arg.reason;
    
    var cancelTravelModel = db.model("carpoolCancelTravel",sm.CarpoolCancelTravelSchema);
    var calcenTravelEntity = new cancelTravelModel({
        travel:travelId,
        userId:userId,
        userName:userName,
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
