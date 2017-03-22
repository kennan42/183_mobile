var MEAP = require("meap");
var mongoose = require("mongoose");
var AnalySchema = require("../AnalySchema.js");

/**
 * 添加加班申请记录
 * @author donghua.wang
 * @date 2016年3月4日 14:01
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("analy.addOvertimeLog start");
    Response.setHeader("Content-Type", "text/json;charset=utf-8");

    var arg = JSON.parse(Param.body.toString());
    if (!arg.userId) {
        Response.end(JSON.stringify({
            "status" : "-1"
        }));
        return;
    }

    var userId = arg.userId;
    var startTime = arg.startTime;
    var endTime = arg.endTime;
    var time = arg.time;
    var times = Date.now();
    var conn = mongoose.createConnection(global.mongodbURL);
    var analyOvertimeModel = conn.model("analy_overtime_log", AnalySchema.AnalyOvertimeLogSchema);
    var analyOvertime = new analyOvertimeModel({
        "userId" : userId,
        "startTime" : startTime,
        "endTime" : endTime,
        "time" : time,
        "createTime" : times
    });
    analyOvertime.save(function(err, rs) {
        conn.close();
        console.log("analy.addOvertimeLog end");
        if (err) {
            Response.end(JSON.stringify({
                "status" : "-1"
            }));
        } else {
            Response.end(JSON.stringify({
                "status" : "0"
            }));
        }
    });
}

exports.Runner = run;

