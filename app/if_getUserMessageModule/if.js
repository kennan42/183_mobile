var MEAP = require("meap");
var mongoose = require("mongoose");
var async = require("async");
var appSchema = require("../AppSchema.js");

/**
 * 查询用户消息推送模块
 * @author donghua.wang
 * @date 2015年10月14日 15:06
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("app.getUserMessageModule start");
    Response.setHeader("Content-Type", "application/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var pageNumber = arg.pageNumber;
    if (!pageNumber) {
        pageNumber = 1;
    }
    var pageSize = arg.pageSize;
    if (!pageSize) {
        pageSize = 10;
    }
    var skip = (pageNumber - 1) * pageSize;
    var conn = mongoose.createConnection(global.mongodbURL);
    async.parallel([
    //查询天信消息模块
    function(cb) {
        var appMessageModule = conn.model("app_message_module", appSchema.appMessageModuleSchema);
        appMessageModule.find({"status":1}).sort({
            "moduleName" : 1
        }).skip(skip).exec(function(err, data) {
            cb(err, data);
        });
        ;
    },
    //查询个人消息设置
    function(cb) {
        var regExp = new RegExp(userId);
        var appUserMessageModuleModel = conn.model("app_user_message_module", appSchema.appUserMessageModuleSchema);
        appUserMessageModuleModel.find({
            "userId" : regExp
        }, function(err, data) {
            cb(err, data);
        })
    }], function(err, data) {
        conn.close();
        var appModules = data[0];
        var userModules = data[1];
        var rs = getUserMessageModule(appModules, userModules);
        console.log("app.getUserMessageModule end");
        Response.end(JSON.stringify({
            "status" : "0",
            "data" : rs
        }));
    });
}

function getUserMessageModule(appModules, userModules) {
    var rs = [];
    for (var i in appModules) {
        var appModule = appModules[i].toObject();
        var moduleCode = appModule.moduleCode;
        var receiveMsg = 1;
        for (var j in userModules) {
            if (userModules[j].moduleCode == moduleCode && userModules[j].status == 0) {
                receiveMsg = 0;
                break;
            }
        }
        appModule.receiveMsg = receiveMsg;
        rs.push(appModule);
    }
    return rs;
}

exports.Runner = run;

