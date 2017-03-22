var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");
var util = require("../../base/util.js");
var jpushUtil = require("../../jpush2/jpush_util.js");

/**
 * 司机-取消开车 
* @author xialin
 * @version 2016年04月06日11:01
   状态：已完成
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
    async.series([getTravelById,cancelTravel, addCalcelTravelDocument], function(err, data) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        db.close();
        if (!err) {
            Response.end(JSON.stringify({
                status : "0",
				msgStatus:"S4000109",
                msg : "取消成功"
            }));
        } else {
            Response.end(JSON.stringify({
                status : "-1",
				msgStatus:"E4000117",
                msg : "取消失败"
            }));
        }
    });
}

//获取行程对象
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
            // 查找乘客，推送消息
            travelModel.find({
                travelSerialNumber : serialNumber,
                userType : {$in:[2,4]},
                state : 2
            }).exec(function(err, data) {
                
                if (!err) {
                    
                    if(data.length>0){
                        var userIds = [];
                     
                    for (var i in data) {
                         userIds.push(data[i].userId);
                    }
                    
					
					
					var content ="您预约的" + util.getMMddHHmmFromTimes(travelObj.startDate) + "从" + travelObj.startCity 
                                    + "到" + travelObj.arriveCity + "的行程已被司机取消，请您尽快重新预约其他行程。";
					if(travelObj.startCityCode==travelObj.arriveCityCode){
						content= "您预约的" + util.getMMddHHmmFromTimes(travelObj.startDate) + "从" + travelObj.startAddress 
                                    + "到" + travelObj.arriveAddress + "的行程已被司机取消，请您尽快重新预约其他行程。";
					}
					
                    var jpushArg = {
                        userid:arg.userId,
                        userList:userIds,
                        title:"",
                        content:content,
                        type:0,
                        msgType:"Carpool",
                        subModule:"CarpoolPassenger"
                    };
                    
                        jpushUtil.jpush(jpushArg);
                        
                    }
         
					
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
		company:arg.company,
        type : 1,
        reason : "",
        createdAt : new Date().getTime()
    });

    cancelTravelEntity.save(function(err, doc) {
        callback(err, doc);
    });
}



exports.Runner = run;

