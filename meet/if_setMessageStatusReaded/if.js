var MEAP = require("meap");
var mongoose = require("mongoose");
var baseSchema = require("../../base/BaseSchema.js");

function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var module = arg.module;
    Response.setHeader("Content-Type", "text/json;charset=utf-8");
    var db = mongoose.createConnection(global.mongodbURL);
    var basePushMessageLogModel = db.model("basePushMessageLog", baseSchema.BasePushMessageLogSchema);
    basePushMessageLogModel.update({"userId":userId,"module":module}, {
        "readStatus" : 1
    }, {
        "multi" : true,
        "upsert" : false
    }, function(err, data) {
        db.close();
        if (!err) {
            Response.end(JSON.stringify({
                "status" : "0",
                "msg" : "更新成功"
            }));
        } else {
            Response.end(JSON.stringify({
                "status" : "-1",
                "msg" : "更新失败"
            }));
        }
    });
}

exports.Runner = run;

