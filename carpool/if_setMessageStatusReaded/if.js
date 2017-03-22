var MEAP = require("meap");
var mongoose = require("mongoose");
var baseSchema = require("../../base/BaseSchema.js");

/**
 * 
 * 设置拼车消息读取状态
 * 作者：xialin
 * 时间：2016-01-19
 * 状态：待修改
 * 
 * 
 * 
 * 
 */


function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var module = arg.module;
    var condition = {
        "userId" : userId,
        "module" : "Carpool"
    };
    Response.setHeader("Content-Type", "text/json;charset=utf-8");
    if (module == "carpool") {
        condition.subModule = "CarpoolJourneyIssue";
    } else if (module == "driveRecord") {
        condition.subModule = {
            "$in" : ["CarpoolBookSeat", "CarpoolBookCancel","CarpoolJourneyRemind2"]
        };
    } else if (module == "carpoolRecord") {
        condition.subModule = {
            "$in" : ["CarpoolJourneyIssueAddPassenger", "CarpoolJourneyCancel", "CarpoolpassengerChange", "CarpoolJourneyRemind"]
        };
    } else {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "参数传递错误"
        }));
    }
    console.log("condition--->", condition);
    var db = mongoose.createConnection(global.mongodbURL);
    var basePushMessageLogModel = db.model("basePushMessageLog", baseSchema.BasePushMessageLogSchema);
    basePushMessageLogModel.update(condition, {
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

