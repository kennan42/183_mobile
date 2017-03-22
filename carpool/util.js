var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var schedule = require("node-schedule");
var baseSchema = require("../base/BaseSchema.js");
var carpoolSchema = require("../carpool/carpoolSchema.js");

//拼车redis
var redisConst = {
    "ttl":86400,
    "redisDB":12
};

var util = {
    pushMsg : function(arg) {
        var appId = arg.appId;
        var userId = arg.userCodeListStr;
        var db = mongoose.createConnection(global.mongodbURL);
        var basePushMessageLogModel = db.model("basePushMessageLog",baseSchema.BasePushMessageLogSchema);
        basePushMessageLogModel.count({
            appId : appId,
            userId : userId,
            readStatus:0
        }, function(err, count) {
            db.close();
            if (!err) {
                arg.badgeNum = count + 1;
                var option = {
                     agent:false,
                    method : "POST",
                    url : global.pushURL,
                    Body : arg,
                    Enctype : "application/x-www-form-urlencoded"
                };
                MEAP.AJAX.Runner(option, function(err, res, data) {
                    // {"info":"","status":"ok","messageList":null}
                    var pushResult = JSON.parse(data);
                    var status = pushResult.status;
                    if(status == "ok"){
                        savePushMsgLog(arg);
                    }
                }, null);
            }
        });
    }
}

//保存推送消息记录
function savePushMsgLog(arg){
     var db = mongoose.createConnection(global.mongodbURL);
     var basePushMessageLogModel = db.model("basePushMessageLog",baseSchema.BasePushMessageLogSchema);
     var basePushMessageLogEntity = new basePushMessageLogModel({
         appId:arg.appId,
         userId:arg.userCodeListStr,
         title:arg.title,
         body:arg.body,
         pushTime:new Date().getTime(),
         readStatus:0,
         uniqueFlag:arg.body.uniqueFlag
     });
     basePushMessageLogEntity.save(function(err){
         db.close();
     });
}

exports.pushMsg = util.pushMsg;
exports.getAutoPublishTravels = util.getAutoPublishTravels;
exports.test = util.test;
exports.redisConst=redisConst;
