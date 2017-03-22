var MEAP = require("meap");
var mongoose = require("mongoose");
var baseSchema = require("../BasePushSchema.js");
/**
 * 更新推送消息开关设置
 * @author ken
 * @date 2015年11月11日 16:58
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("----setPushMsgStatus");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var status = arg.status;
    var msgType = arg.msgType;

    if (userId == null) {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "userId is null"
        }));
        return;
    }
    if (status == null) {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "status is null"
        }));
        return;
    }

    if (msgType == null) {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "msgType is null"
        }));
        return;
    }

    var db = mongoose.createConnection(global.mongodbURL);
    var pushMsgStatusModel = db.model("pushMsgStatus", baseSchema.pushMsgStatusSchema);

    pushMsgStatusModel.update({
        userId : userId,
        msgType : msgType
    }, {
        $set : {
            status : status
        }
    }, function(err) {
        db.close();
        if (!err) {
            Response.end(JSON.stringify({
                "status" : "0",
                "msg" : "update ok"
            }));
        } else {
            Response.end(JSON.stringify({
                "status" : "-1",
                "msg" : "update err"
            }));
        }

    });

}

exports.Runner = run; 