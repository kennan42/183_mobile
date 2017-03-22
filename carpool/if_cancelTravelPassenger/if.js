var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");
var util = require("../../base/util.js");
var jpushUtil = require("../../jpush2/jpush_util.js");

/**
 * 乘客-取消约车 
* @author xialin          因为是约车单，不用推送
 * @version 2016年04月08日11:01
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
       
        callback(err, data);
        

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
        type : 3,
        reason : "",
        createdAt : new Date().getTime()
    });

    cancelTravelEntity.save(function(err, doc) {
        callback(err, doc);
    });
}



exports.Runner = run;

