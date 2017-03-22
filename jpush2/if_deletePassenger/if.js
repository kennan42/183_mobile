var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");
var util = require("../../base/util.js");
var jpushUtil = require("../../jpush2/jpush_util.js");

/**
 * 移除乘客
 * @author wangdonghua
 * @version 2014年12月27日14:37
 * */
var arg = null;
var db = null;
function run(Param, Robot, Request, Response, IF) {
    arg = JSON.parse(Param.body.toString());
    db = mongoose.createConnection(global.mongodbURL);
    main(Response);
}

function main(Response){
    async.parallel([deletePassenger,updateTravelSeatState,addDelUserDocument,getTravelById],function(err,data){
        Response.setHeader("Content-type","text/json;charset=utf-8");
        db.close();
        if(!err){   
             //推送消息给乘客
             var travelObj = data[3];
            Response.end(JSON.stringify({
                status:"0",
                msg:"移除成功"
            }));
			var userIds = [];
			 userIds.push(arg.rejectedUserId);
             var pushArg = {
                           appId:global.appId,
                           platforms:"0,1",
                           title:"您预约的" + util.getMMddHHmmFromTimes(travelObj.startDate) + "从" + travelObj.startCity
                                  + "到" + travelObj.arriveCity + "的行程已被司机移出，请您尽快重新预约其他行程。",
                           body:new Date().getTime() + "_CarpoolpassengerChange",
                           userIds:userIds ,
                           badgeNum:3,
                           module:"Carpool",
                           subModule:"CarpoolpassengerChange",
                           type:"remind"
                                 };
           //util.pushMsg(pushArg);
		   var jpushArg = {
			   userid:travelObj.userId,
			   userList:userIds,
			   title:"",
			   content:pushArg.title,
			   type:0
		   };
		   jpushUtil.jpush(jpushArg);
        }else{
            Response.end(JSON.stringify({
                status:"-1",
                msg:"移除失败"
            }));
        }
    });
}

//更新乘客行程为被踢
function deletePassenger(callback) {
    var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
    travelModel.update({
        travelSerialNumber : arg.serialNumber,
        userId : arg.rejectedUserId
    }, {
        state : 1
    },{
        multi:true
    }, function(err, data) {
        callback(err, data);
    });
}

//更新座位数
function updateTravelSeatState(callback) {
      var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
      travelModel.update({_id:arg.travleId},{$inc:{bookedSeatCount:-1},seatState:0},function(err,data){
          callback(err,data);
      });
}

//添加踢人记录
function addDelUserDocument(callback) {
    var rejectModel = db.model("carpoolReject", sm.CarpoolRejectSchema);
    var rejectEntity = new rejectModel({
        userId : arg.userId,
        userName : arg.userName,
        rejectedUserId : arg.rejectedUserId,
        rejectedUserName : arg.rejectedUserName,
        travle : arg.travleId,
        reason : arg.reason,
        createdAt : new Date().getTime()
    });
    rejectEntity.save(function(err, doc) {
        callback(err,doc);
    });
}

function getTravelById(callback){
     var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
     travelModel.findById(arg.travleId,function(err,data){
         callback(err,data);
     });
}

exports.Runner = run;

