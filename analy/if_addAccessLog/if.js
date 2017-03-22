var MEAP = require("meap");
var mongoose = require("mongoose");
var analySchema = require("../AnalySchema.js");

var conn;
var AnalyPageVisitLogModel;
function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type", "text/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    conn = mongoose.createConnection(global.mongodbURL);
    AnalyPageVisitLogModel = conn.model("analy_page_visit_log", analySchema.AnalyPageVisitLogSchema);
    switch (arg.op) {
        case "create":
            saveLog(arg, Response);
            break;
        case "update":
            updateLog(arg, Response);
            break;
        default:
            Response.end(JSON.stringify({
                "status": "-1",
                "msg": "非法op"
            }));

    }

}

function saveLog(arg, Response) {
    // Schema有相关说明
    var AnalyPageVisitLog = new AnalyPageVisitLogModel({
        "userId": arg.userId,
        "type": arg.type,
        "module": arg.module,
        "page": arg.page,
        "startTime": arg.startTime,
        "endTime": arg.endTime,
        "stayTime": arg.stayTime,
        "createTime": new Date().getTime()
    });
    AnalyPageVisitLog.save(function (err, data) {
        conn.close();
        Response.end(JSON.stringify({
            "status": "0"
        }));
    });
}

function updateLog(arg, Response) {
    AnalyPageVisitLogModel.update({
        "userId": arg.userId,
        "type": arg.type,
        "module": arg.module,
        "page": arg.page,
        "startTime": arg.startTime
    }, {
        "endTime": arg.endTime,
        "stayTime": arg.stayTime
    }, function (err, data) {
        conn.close();
        Response.end(JSON.stringify({
            "status": "0"
        }));
    });
}

exports.Runner = run;


                                

	

