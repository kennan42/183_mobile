var MEAP = require("meap");
var async = require("async");
var mongoose = require("mongoose");
var qxSchema = require("../qxSchema.js");

function run(Param, Robot, Request, Response, IF) {
    console.log("qx.register start");
    Response.setHeader("Content-Type", "application/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var nickName = arg.nickName;
    var conn = mongoose.createConnection(global.mongodbURL);
    var registerModel = conn.model("qx_register", qxSchema.qxRegisterSchema);
    var hasRegister = false;
    async.series([
    function(cb) {
        registerModel.findOne({
            "userId" : userId
        }, function(err, data) {
            if (data != null) {
                hasRegister = true;
            }
            cb(err, null);
        });
    },
    function(cb) {
        if (!hasRegister) {
            var register = new registerModel({
                "userId" : userId,
                "nickName" : nickName,
                "createTime" : new Date().getTime()
            });
            register.save(function(err) {
                cb(err, null);
            });
        } else {
            cb(null, null);
        }

    }], function(err, data) {
        conn.close();
        console.log("qx.register end");
        if (!err) {
            Response.end(JSON.stringify({
                "status" : "0",
                "hasRegister" : hasRegister,
                "msg" : hasRegister ? "已经有人注册" : "注册成功"
            }));
        } else {
            Response.end(JSON.stringify({
                "status" : "-1",
                "msg" : "注册失败"
            }));

        }
    });
}

exports.Runner = run;

