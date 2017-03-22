var MEAP = require("meap");
var mongoose = require("mongoose");
var BaseSchema = require("../BaseSchema.js");

/**
 * 清空一个月前的无用记录
 * @author donghua.wang
 * @date 2015年08月05日 13:07
 * */
function run(Param, Robot, Request, Response, IF) {
    Response.end("clearDataTask");
    clearMessagePushRecord();
    clearOpLog();
}

function clearMessagePushRecord() {
    var db = mongoose.createConnection(global.mongodbURL);
    var pusuMessageLogModel = db.model("basePushMessageLog", BaseSchema.BasePushMessageLogSchema);
    var times = new Date().getTime();
    var preMonthTimes = times - 86400 * 1000 * 30;
    pusuMessageLogModel.remove({
        "pushTime" : {
            "$lte" : preMonthTimes
        }
    }, function(err, count) {
        db.close();
    });
}

function clearOpLog() {
    var db = mongoose.createConnection(global.mongodbURL);
    var baseOpLogModel = db.model("baseOpLog", BaseSchema.BaseOpLogSchema);
    var times = new Date().getTime();
    var preMonthTimes = times - 86400 * 1000 * 30;
    baseOpLogModel.remove({
        "createTime" : {
            "$lte" : preMonthTimes
        }
    }, function(err, count) {
        db.close();
    });
}

exports.Runner = run;

