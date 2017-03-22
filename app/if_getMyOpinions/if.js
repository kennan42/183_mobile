var MEAP = require("meap");
var mongoose = require("mongoose");
var appSchema = require("../AppSchema.js");

/**
 *查询个人意见反馈列表
 * @author donghua.wang
 * @date 2015年10月8日 09:29
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("app.getMyOpinions start");
    Response.setHeader("Content-Type", "application/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    if (!userId) {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "获取用户信息失败"
        }));
        return;
    }

    var condition = {
        "userId" : userId
    };
    var status = arg.status;
    if (status) {
        condition.status = status;
    }
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
    var appOpinionModel = conn.model("app_opinion", appSchema.appOpinionSchema);
    appOpinionModel.find(condition).skip(skip).limit(pageSize).sort({
        "createTime" : -1
    }).exec(function(err, data) {
        console.log("app.getMyOpinions end");
        Response.end(JSON.stringify({
            "status" : "0",
            "data" : data
        }));
        appOpinionModel.update({
            "userId" : userId
        }, {
            "readStatus" : 1,
            "readTime":new Date().getTime()
        }, {
            "multi" : true
        }, function(err) {
            conn.close();
        });
    });
}

exports.Runner = run;

