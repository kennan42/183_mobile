var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");
var baseSchema = require("../../base/BaseSchema.js");
var util = require("../../base/util.js");

/**
 * 3.4冻结会议室（何佳欢）
 */
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var db = mongoose.createConnection(global.mongodbURL);
    var MeetRoomModel = db.model("meetRoom", sm.MeetRoomSchema);
    var roomId = arg.roomId;
    var startTime = parseInt(arg.startTime);
    var endTime = parseInt(arg.endTime);
    var reason = arg.reason;
    MeetRoomModel.update({
        _id : arg.roomId
    }, {
        frozenBegin : startTime,
        frozenEnd : endTime,
        frozenReason : reason,
        state : 2
    }, function(err, data) {
        db.close();
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        console.log("err", err);
        if (!err) {
            Response.end(JSON.stringify({
                status : 0,
                msg : "冻结成功"
            }));
            updateMeetBookState(arg);
            addLog(arg);
        } else {
            Response.end(JSON.stringify({
                status : -1,
                msg : "冻结失败"
            }));
        }
    });
}

//更新会议室预约状态
function updateMeetBookState(arg) {
    var roomId = arg.roomId;
    var startTime = parseInt(arg.startTime);
    var endTime = parseInt(arg.endTime);
    var db = mongoose.createConnection(global.mongodbURL);
    var MeetBookModel = db.model("meetBook", sm.MeetBookSchema);
    MeetBookModel.find({}, function(err, data) {
        if (!err && data.length > 0) {
            MeetBookModel.update({
                meetRoom : roomId,
                state : 2,
                startTime : {
                    $lte : endTime
                },
                endTime : {
                    $gte : startTime
                }
            }, {
                state : 3,
                comments : '会议室冻结'
            }, function(err) {
                db.close();
                if (err) {
                    pushMsg(i, data);
                }
            });
        } else {
            db.close();
        }
    });

}

//消息推送
function pushMsg(i, data) {
    i = i || 0;
    if (i < data.length) {
        var pushArg = {
            appId : global.appId,
            platforms : "0,1",
            title : "您申请的" + data[i].name + "会议室已冻结",
            body : JSON.stringify({
                page : "welcome.html",
                uniqueFlag : new Date().getTime() + "_" + data[i].userId
            }),
            userCodeListStr : data[i].userId,
            badgeNum : 3,
            module : "meet"
        };
        util.pushMsg(pushArg);
        i++;
        pushArg(i,data);
    }
}

function addLog(arg){
    var db = mongoose.createConnection(global.mongodbURL);
    var logModel = db.model("meetRoom",baseSchema.BaseOpLogSchema);
    var logEntity = new logModel({
        opType:"u",
        opArg:arg,
        opDocument:"meetRoom",
        userId:arg.userId,
        userName:arg.userName,
        updateTime:util.getDateStrFromTimes(new Date().getTime(),true)
    });
    logEntity.save(function(err){
        db.close();
    });
}

exports.Runner = run;

