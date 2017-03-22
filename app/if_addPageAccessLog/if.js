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
            "status" : "-1",
            "msg" : "userId is null"
        }));
        return;
    }
    var module = arg.module;
    if (module == null) {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "module is null"
        }));
        return;
    }
    var subModule = arg.subModule;
    if (subModule == null) {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "subModule is null"
        }));
        return;
    }
    var page = arg.page;
    if (page == null) {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "page is null"
        }));
        return;
    }
    var startTime = arg.startTime;
    if (startTime == null) {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "startTime is null"
        }));
        return;
    }
    var endTime = arg.endTime;
    if (endTime == null) {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "endTime is null"
        }));
        return;
    }
    var stayTime = arg.stayTime;
    if (stayTime == null) {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "stayTime is null"
        }));
        return;
    }

    var conn = mongoose.createConnection(global.mongodbURL);
    var userOjb = null;

    async.series([
    //查询用户信息
    function(cb) {
        var regExp = new RegExp(userId);
        var userModel = conn.model("base_user", contactSchema.BaseUserSchema);
        userModel.findOne({
            "PERNR" : regExp
        }, function(err, data) {
            if (data == null) {
                cb(-1, null);
            } else {
                userOjb = data;
				cb(err,"");
            }
        });
    },
    //添加访问日志
    function(cb) {
        var appPageVisitLogModel = conn.model("app_visit_page_log", appSchema.appVisitPageLogSchema);
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
        var appPageVisitLog = new appPageVisitLogModel({
            "userId" : arg.userId,
            "userName" : userName,
            "setx" : sex,
            "age" : age,
            "dept" : dept,
            "deptName" : deptName,
            "plans" : plans,
            "plstx" : plstx,
            "stell" : stell,
            "stltx" : stltx,
            "module" : arg.module,
            "subModule" : subModule,
            "page" : arg.page,
            "startTime" : arg.startTime,
            "endTime" : arg.endTime,
            "stayTime" : arg.stayTime,
            "createTime" : new Date().getTime(),
        });
        appPageVisitLog.save(function(err) {
            cb(err, null);
        });
    }], function(err, data) {
        conn.close();
        if (err) {
            Response.end(JSON.stringify({
                "status" : "-1",
                "msg" : "add page access log fail"
            }));
        } else {
            Response.end(JSON.stringify({
                "status" : "0",
                "msg" : "add page access log success"
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

