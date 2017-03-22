var MEAP = require("meap");
var mongoose = require("mongoose");
var async = require("async");
var appSchema = require("../AppSchema.js");

/**
 * 添加app更新日志
 * @author donghua.wang
 * @date 2015年10月13日 08:48
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("app.addAppUpdateLog start");
    Response.setHeader("Content-Type", "text/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var appId = arg.appId;
    var appName = arg.appName;
    var appVersion = arg.appVersion;
    var times = new Date().getTime();
    if (userId == null) {
        Response.end(JSON.stringify({
            "status":"-1",
            "msg":"userId is null"
        }));
        return;
    }
    var conn = mongoose.createConnection(global.mongodbURL);
    var appInstallLogModel = conn.model("app_install_log", appSchema.appInstallLogSchema);
    var appInstalledModel = conn.model("app_install", appSchema.installedAppSchema);
    async.parallel([
    //添加更新日志
    function(cb) {
        var appInstallLog = new appInstallLogModel({
            "userId" : userId,
            "appId" : appId,
            "appName" : appName,
            "appVersion" : appVersion,
            "opType" : 3,
            "createTime" : times
        });
        appInstallLog.save(function(err, data) {
            cb(err, null);
        });
    },
    //更新app版本信息
    function(cb) {
        appInstalledModel.update({
            "userId" : userId,
            "appId" : appId
        }, {
            "appVersion" : appVersion,
            "updateTime" : times
        }, function(err) {
             cb(err,null);   
        });
    }], function(err, data) {
            conn.close();
            console.log("app.addAppUpdateLog end");
            if(err){
               Response.end(JSON.stringify({
                   "status":"-1"
               }));
            }else{
                Response.end(JSON.stringify({
                    "staus":"0"
                }));
            }
    });
}

exports.Runner = run;

