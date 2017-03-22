var MEAP = require("meap");
var async = require("async");
var mongoose = require("mongoose");
var qxSchema = require("../qxSchema.js");

function run(Param, Robot, Request, Response, IF) {
    console.log("qx.existsUser start");
    Response.setHeader("Content-Type", "application/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var conn = mongoose.createConnection(global.mongodbURL);
    var registerModel = conn.model("qx_register", qxSchema.qxRegisterSchema);
    registerModel.findOne({
        "userId" : userId
    }, function(err, data) {
        conn.close();
        console.log("qx.existsUser end");
        if (err) {
            Response.end(JSON.stringify({
                "status" : "-1",
                "msg" : "查询失败"
            }));
        } else {
            Response.end(JSON.stringify({
                "status" : "0",
                "exists" : data != null ? true : false,
                "msg" : "查询成功"
            }));
        }
    });
}

exports.Runner = run;

