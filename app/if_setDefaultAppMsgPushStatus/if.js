var MEAP = require("meap");
var mongoose = require("mongoose");
var appSchema = require("../AppSchema.js");

/**
 *添加默认应用安装日志
 *@author donghua.wang
 *@date 2015年10月13日 13:35
*/
function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type", "application/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var apps = arg.apps;
    if (userId == null) {
        Response.end(JSON.stringify({
            "status":"-1",
            "msg":"userId is null"
        }));
        return;
    }
    var conn = mongoose.createConnection(global.mongodbURL);
    var appInstallModel = conn.model("app_install", appSchema.installedAppSchema);
    setAppMsgPushStatus(0, conn, appInstallModel, userId, apps, Response);
}

function setAppMsgPushStatus(i, conn, appInstallModel, userId, apps, Response) {
    i = i || 0;
    if (i < apps.length) {
        var app = apps[i];
        var appInstall = new appInstallModel({
            "userId" : userId,
            "appId" : app.appId,
            "appName" : app.appName,
            "appVersion" : app.appVersion,
            "receveMsg" : 1,
            "createTime" : new Date().getTime(),
            "updateTime" : 0
        });
        appInstall.save(function(err, data) {
            i++;
            setAppMsgPushStatus(i, conn, appInstallModel, userId, apps, Response);
        });
    } else {
        conn.close();
        Response.end(JSON.stringify({
            "status" : "0"
        }));
    }
}

exports.Runner = run;

