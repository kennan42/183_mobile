var MEAP = require("meap");
var mongoose = require("mongoose");
var appSchema = require("../AppSchema.js");

function run(Param, Robot, Request, Response, IF) {
    console.log("app.setUserMsgPushStatus start");
    Response.setHeader("Content-Type", "text/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var status = arg.status;
    var conn = mongoose.createConnection(global.mongodbURL);
    var appUserMsgPushStatusModel = conn.model("app_user_msgpush_status", appSchema.appUserMsgPushStatusSchema);
    appUserMsgPushStatusModel.update({
        "userId" : userId
    }, {
        "status" : status,
        "updateTime" : new Date().getTime()
    }, {
        "upsert" : true
    }, function(err) {
        conn.close();
         console.log("app.setUserMsgPushStatus end");
        Response.end(JSON.stringify({
            "status" : "0"
        }));
    });
}

exports.Runner = run;

