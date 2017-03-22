var MEAP = require("meap");
var mongoose = require("mongoose");
var appSchema = require("../AppSchema.js");

/**
 * 查询用户已安装子应用列表
 * @author donghua.wang
 * @date 2015年8月17日 09:29
 * */
function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type", "text/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var pageNumber = arg.pageNumber;
    var pageSize = arg.pageSize;
    var skip = (pageNumber - 1) * pageSize;
    if (userId == null) {
        Response.end(JSON.stringify({
            "status":"-1",
            "msg":"userId is null"
        }));
        return;
    }
    var conn = mongoose.createConnection(global.mongodbURL);
    var appInstalledListModel = conn.model("app_install", appSchema.installedAppSchema);
    appInstalledListModel.find({
        "userId" : userId
    }).skip(skip).limit(pageSize).sort({
        "appName" : 1
    }).exec(function(err,data) {
        conn.close();
        Response.end(JSON.stringify({
            "status":"0",
            "msg":"查询成功",
            "data":data
        }));
    });
}

exports.Runner = run;

