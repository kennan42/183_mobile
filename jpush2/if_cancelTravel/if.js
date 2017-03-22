var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");
var util = require("../../base/util.js");
var jpushUtil = require("../../jpush2/jpush_util.js");

/**
 * 取消行程
 * @author wangdonghua
 * @version 2014年12月26日14:29
 * */
var db = null;
var arg = null;
var travelObj = null;
function run(Param, Robot, Request, Response, IF) {
    arg = JSON.parse(Param.body.toString());
    db = mongoose.createConnection(global.mongodbURL);
    main(Response);
}

function main(Response) {
    async.series([getTravelById,cancelTravel,deleteAutoPublishTravel, addCalcelTravelDocument], function(err, data) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        db.close();
        if (!err) {
            Response.end(JSON.stringify({
                status : "0",
                msg : "取消成功"
            }));
        } else {
            Response.end(JSON.stringify({
                status : "-1",
                msg : "取消失败"
            }));
        }
    });
}

function getTravelById(callback){
     var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
     travelModel.findById(arg.travelId,function(err,data){
         travelObj = data;
         callback(err,"");
     });
}

//取消行程
function cancelTravel(callback) {
    var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
    var serialNumber = arg.serialNumber;
    travelModel.update({
        travelSerialNumber : serialNumber,
        state : 0
    }, {
        state : 2
    }, {
        multi : true
    }, function(err, data) {
        if (!err) {
            // push msg to passenger
            travelModel.find({
                travelSerialNumber : serialNumber,
                userType : 2,
                state : 2
            }).exec(function(err, data) {
                console.log("err2--->", err);
                if (!err) {
					var userIds = [];
					 var pushArg = {
                            appId : global.appId,
                            platforms : "0,1",
                            title :"您预约的" + util.getMMddHHmmFromTimes(travelObj.startDate) + "从" + travelObj.startCity 
                                    + "到" + travelObj.arriveCity + "的行程已被司机取消，请您尽快重新预约其他行程。",
                            body : new Date().getTime()  + "_CarpoolJourneyCancel",
                            badgeNum : 3,
                            module:"Carpool",
                            subModule:"CarpoolJourneyCancel",
                            type:"remind"
                        }; 
                    for (var i in data) {
                         userIds.push(data[i].userId);
                    }
					pushArg.userIds = userIds;
					//util.pushMsg(pushArg);
					var jpushArg = {
						userid:arg.userId,
						userList:userIds,
						title:"",
						content:pushArg.title,
						type:0
					};
					jpushUtil.jpush(jpushArg);
                }
                callback(err, data);
            });
        } else {
            callback(-1, data);
        }

    })
}

//添加取消行程记录
function addCalcelTravelDocument(callback) {
    var cancelTravelModel = db.model("carpoolCancelTravel", sm.CarpoolCancelTravelSchema);
    var cancelTravelEntity = new cancelTravelModel({
        travel : arg.travelId,
        userId : arg.userId,
        userName : arg.userName,
        type : 1,
        reason : "",
        createdAt : new Date().getTime()
    });

    cancelTravelEntity.save(function(err, doc) {
        callback(err, doc);
    });
}

function deleteAutoPublishTravel(callback){
    var cancelAutoPublishTravel = arg.cancelAutoPublishTravel;
    //取消自动发布
    if(cancelAutoPublishTravel == '1'){
        var autoPublishTravelId = arg.autoPublishTravelId;
        var autoPublishTravelModel = db.model("carpoolAutoPublishTravel", sm.CarpoolAutoPublishTravelSchema);
        autoPublishTravelModel.remove({_id:autoPublishTravelId},function(err){
             callback(err,"");
        });
    }else{
        callback(null,"");
    }
}

exports.Runner = run;

