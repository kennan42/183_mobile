var MEAP = require("meap");
var mongoose = require("mongoose");
var appSchema = require("../AppSchema.js");

function run(Param, Robot, Request, Response, IF) {
    console.log("app.setUserMsgModuleStatus start");
    Response.setHeader("Content-Type", "application/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var moduleCode = arg.moduleCode;
    var status = arg.status;
    var conn = mongoose.createConnection(global.mongodbURL);
    appUserMessageModuleModel = conn.model("app_user_message_module", appSchema.appUserMessageModuleSchema);
    appUserMessageModuleModel.update({
        "userId" : userId,
        "moduleCode" : moduleCode
    }, {
        "status" : status,
        "updateTime" : new Date().getTime()
    }, {
        "upsert":true
    }, function(err) {
        conn.close();
        console.log("app.setUserMsgModuleStatus end");
        Response.end(JSON.stringify({
            "status":"0"
        }));
    });
}

exports.Runner = run;

