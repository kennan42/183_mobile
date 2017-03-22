var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");
var baseSchema = require("../../base/BaseSchema.js");
var async = require("async");

/**
 * 3.7编辑会议室（董元）
 */
function run(Param, Robot, Request, Response, IF) {
    try {
        var arg = JSON.parse(Param.body.toString());
        var defaultImage = [{
        imageURL:global.nginxURL + "uploads/meet/" + "defaultMeet.jpg",
        compressedImageURL:global.nginxURL + "uploads/meet/" + "defaultMeet2.jpg"
    }];
        var db = mongoose.createConnection(global.mongodbURL);
        var MeetRoomModel = db.model("meetRoom", sm.MeetRoomSchema);
        MeetRoomModel.update({
            "_id" : arg.roomId
        }, {
            guishudiId:arg.guishudiCode,
            guishudiName:arg.guishudiName,
            name:arg.name,
            capacity:arg.capacity,
            address:arg.address,
            level:arg.level,
            needApply:arg.needApply,
            clearMinute:arg.clearMinute,
            type:arg.type,
            admin:arg.admin,
            servicePersonal:arg.servicePersonal,
            technicist:arg.technicist,
            device:arg.device,
            image:arg.image==""?defaultImage:arg.image,
            updateUser:arg.updateUser,
            updateTime:new Date().getTime()
        },{
            upsert:false,
            multi:false
        }, function(err) {
            db.close();
            if (!err) {
                Response.end(JSON.stringify({
                    status : "0",
                    msg : "编辑成功"
                }));
                addLog(arg);
            } else {
                Response.end(JSON.stringify({
                    status : "-1",
                    msg : "编辑失败"
                }));
            }
        });

    } catch(e) {
        Response.end(JSON.stringify({
            status : "-1",
            msg : "编辑失败"
        }));
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

