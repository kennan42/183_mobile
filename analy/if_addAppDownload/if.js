var MEAP = require("meap");
var mongoose = require("mongoose");
var analySchema = require("../AnalySchema.js");

/**
 * 添加通过nginx下载app日志
 * @author donghua.wang
 * @date 2016年3月14日 10:11
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("analy.addAppDownload start");
    Response.setHeader("Content-Type", "text/json;charset=utf-8");
    var arg = Param.params;
    var version = arg.version;
    var platform = arg.platform;
    var times = Date.now();
    var conn = mongoose.createConnection(global.mongodbURL);
    var analyAppDownloadModel = conn.model("analy_app_download", analySchema.AnalyAppDownloadSchema);
    var analyAppDownload = new analyAppDownloadModel({
        "version" : version,
        "platform" : platform,
        "createTime" : times
    });
    analyAppDownload.save(function(err) {
        conn.close();
        console.log("analy.addAppDownload end");
        Response.end(JSON.stringify({
            "status" : "0",
            "msg" : "添加下载日志成功"
        }));
    });
}

exports.Runner = run;

