var MEAP = require("meap");
var mongoose = require("mongoose");
var async = require("async");
var appSchema = require("../AppSchema.js");

/**
 * 增加消息推送映射模块
 * @author donghua.wang
 * @date 2015年10月7日 11:28
 * */
function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type", "application/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var module = arg.module;
    var appId = arg.appId;
    var conn = mongoose.createConnection(global.mongodbURL);
    var appMsgPushModuleModel = conn.model("app_message_push_module", appSchema.appMsgPushModuleSchema);
    appMsgPushModuleModel.update({
        "appId" : appId,
        "msgModule" : module
    }, {
        "status" : 1
    }, {
        "upsert" : true
    }, function(err) {
        conn.close();
        Response.end(JSON.stringify({
            "status" : "0",
            "msg" : ""
        }));
    });
}

exports.Runner = run;

