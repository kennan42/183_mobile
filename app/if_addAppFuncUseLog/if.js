var MEAP = require("meap");
var mongoose = require("mongoose");
var async = require("async");
var appSchema = require("../AppSchema.js");
var contactSchema = require("../../contact/Contact.js");

function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type", "text/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    if (userId == null) {
        Response.end(JSON.stringify({
            "status": "-1",
            "msg": "userId is null"
        }));
        return;
    }
    var module = arg.module;
    if (module == null) {
        Response.end(JSON.stringify({
            "status": "-1",
            "msg": "module is null"
        }));
        return;
    }
    var subModule = arg.subModule;
    if (subModule == null) {
        Response.end(JSON.stringify({
            "status": "-1",
            "msg": "subModule is null"
        }));
        return;
    }

    var times = arg.times;
    if (times == null) {
        times = -1;
    }

    var conn = mongoose.createConnection(global.mongodbURL);
    var userOjb = null;
    async.series([
        //查询用户信息
        function (cb) {
            var userModel = conn.model("base_user", contactSchema.BaseUserSchema);
            var regExp = new RegExp(userId);
            userModel.findOne({
                "PERNR": regExp
            }, function (err, data) {
                if (data == null) {
                    cb(-1, null);
                } else {
                    userOjb = data;
                    cb(err, null);
                }
            });
        },
        //添加功能访问日志
        function (cb) {
            var userName = userOjb.NACHN;
            var sex = userOjb.GESCH;
            var born = userOjb.GBDAT;
            var age = getAge(born);
            var dept = userOjb.ORGEH;
            var deptName = userOjb.ORGTX;
            var plans = userOjb.PLANS;
            var plstx = userOjb.PLSTX;
            var stell = userOjb.STELL;
            var stltx = userOjb.STLTX;
            var appFuncUseLogModel = conn.model("app_func_uselog", appSchema.appFuncUseLogSchema);
            var appFuncUserlog = new appFuncUseLogModel({
                "userId": userId,
                "userName": userName,
                "sex": sex,
                "age": age,
                "dept": dept,
                "deptName": deptName,
                "plans": plans,
                "plstx": plstx,
                "stell": stell,
                "stltx": stltx,
                "module": module,
                "subModule": subModule,
                "createTime": new Date().getTime(),
                "times": times
            });
            appFuncUserlog.save(function (err) {
                cb(err, "");
            });
        }
    ], function (err, data) {
        conn.close();
        if (err) {
            Response.end(JSON.stringify({
                "status": "-1",
                "msg": "err"
            }));
        } else {
            Response.end(JSON.stringify({
                "status": "0",
                "msg": "success"
            }));
        }
    });

}

//根据出生日期计算年龄
function getAge(born) {
    var arr = born.split("-");
    var year = parseInt(arr[0]);
    var thisYear = new Date().getFullYear();
    var age = thisYear - year;
    return age;
}

exports.Runner = run;
