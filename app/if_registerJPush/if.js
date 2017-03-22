var MEAP = require("meap");
var mongoose = require("mongoose");
var appSchema = require("../AppSchema.js");
var util = require("../../base/util.js");

function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type", "text/json;charset=utf8");
    var headers = Request.headers;
    if (headers.invokeuser == null || headers.invokepass == null) {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "认证失败"
        }));
        return;
    }
    var invokeuser = headers.invokeuser;
    var invokepass = headers.invokepass;
    var username = new Buffer("cttq").toString("base64");
    //Y3R0cQ==
    var password = new Buffer("cttq-123").toString("base64");
    //Y3R0cS0xMjM=
    if (invokeuser != username || invokepass != password) {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "认证失败"
        }));
        return;
    }

    var arg = JSON.parse(Param.body.toString());
    var alias = arg.alias;
    var platform = 1;
    if(arg.platform != 1){
        platform = 0;
    }
    var conn = mongoose.createConnection(global.mongodbURL);
    var jpushRegisterLogModel = conn.model("app_jpush_register_log", appSchema.jpushRegisterLogSchema);
    jpushRegisterLogModel.update({
        "alias" : alias,
        "platform" : platform
    }, {
         "createTime":util.getDateStrFromTimes(new Date().getTime(),true)
    },{
        "upsert":true
    }, function(err) {
        conn.close();
        Response.end(JSON.stringify({
            "status":"0",
            "msg":"注册成功"
        }));
    });
}

exports.Runner = run;

