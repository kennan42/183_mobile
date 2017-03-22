var MEAP = require("meap");
var mongoose = require("mongoose");
var appSchema = require("../AppSchema.js");

/**
 * 记录子应用的下载或者删除日志
 * 如果是下载，则需要设置对应的模块为接收消息推送
 * 如果是删除，则需要设置对应的模块为拒绝消息推送
 * @author donghua.wang
 * @date 2015年10月13日 09:02
 * */
function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type", "text/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var appId = arg.appId;
    var appName = arg.appName;
    var appVersion = arg.appVersion;
    var userId = arg.userId;
    var opType = arg.opType;
    if (userId == null) {
        Response.end(JSON.stringify({
            "status":"-1",
            "msg":"userId is null"
        }));
        return;
    }
    var conn = mongoose.createConnection(global.mongodbURL);
    var appInstallLogModel = conn.model("app_install_log", appSchema.appInstallLogSchema);
    var appInstallLog = new appInstallLogModel({
        "userId" : userId,
        "appId" : appId,
        "appName" : appName,
        "appVersion" : appVersion,
        "opType" : opType,
        "createTime" : new Date().getTime()
    });
    appInstallLog.save(function(err) {
        var appInstalledModel = conn.model("app_install", appSchema.installedAppSchema);
        if (opType == 1) {//安装app，则接收相关模块的消息
            var appInstalledList = new appInstalledModel({
                "userId" : userId,
                "appId" : appId,
                "appName" : appName,
				"appVersion":appVersion,
                "receveMsg" : 1,
                "createTime" : new Date().getTime(),
                "updateTime" : 0
            });
            appInstalledList.save(function(err) {
                conn.close();
                Response.end(JSON.stringify({
                    "status" : "0"
                }));
            });
        } else {//卸载app，则不接收相关模块消息
            appInstalledModel.remove({
                "appId" : appId,
                "userId" : userId
            }, function(err) {
                conn.close();
                Response.end(JSON.stringify({
                    "status" : "0"
                }));
            });
        }
    });

}

exports.Runner = run;

