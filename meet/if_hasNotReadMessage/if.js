var MEAP = require("meap");
var mongoose = require("mongoose");
var baseSchema = require("../../base/BaseSchema.js");

/**
 * 判断用户是否有未读的会议室消息推送
 * @author donghua.wang
 * @date 2015年06月16日 13:28
 * */
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var arr = ["FrozenMeetingRoom", "OutMeetingRoom", "CancelMeetingRoom", "ChangeMeetingRoom", "OffMeetingRoom"];
    var db = mongoose.createConnection(global.mongodbURL);
    var basePushMessageLogModel = db.model("basePushMessageLog", baseSchema.BasePushMessageLogSchema);
    basePushMessageLogModel.findOne({
        "userId" : userId,
        "readStatus" : 0,
        "subModule" : {
            "$in" : arr
        }
    }, function(err, data) {
        db.close();
        if (data != null) {
            Response.end(JSON.stringify({
                "status" : "0",
                "msg" : "有未读消息记录"
            }));
        } else {
            Response.end(JSON.stringify({
                "status" : "-1",
                "msg" : "没有未读消息记录"
            }));
        }
    });
}

exports.Runner = run;

