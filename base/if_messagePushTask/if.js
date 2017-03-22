var MEAP = require("meap");
var mongoose = require("mongoose");
var BaseSchema = require("../BaseSchema.js");

/**
 * 清空一个月前的消息推送记录
 * @author donghua.wang
 * @date 2015年08月05日 13:07
 * */
function run(Param, Robot, Request, Response, IF) {
    var db = mongoose.createConnection(global.mongodbURL);
    var pusuMessageLogModel = db.model("basePushMessageLog", sm.BasePushMessageLogSchema);
    var times = new Date().getTime();
    var preMonthTimes = times - 86400 * 1000 * 30;
    pusuMessageLogModel.remove({
        "pushTime" : {
            "$lte" : preMonthTimes
        }
    }, function(err, count) {
        db.close();
        Response.end("clear push message count:", count);
    });
}

exports.Runner = run;

