var MEAP = require("meap");
var mongoose = require("mongoose");
var appSchema = require("../AppSchema.js");

/**
 * 查询是否有未读回复
 * @author donghua.wang
 * @date 2015年10月10日 10:25
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("app.hasNotReadReply start");
    Response.setHeader("Content-Type", "text/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    if (userId == null) {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "查询用户信息失败"
        }));
        return;
    }
    var conn = mongoose.createConnection(global.mongodbURL);
    var appOpinionModel = conn.model("app_opinion", appSchema.appOpinionSchema);
    appOpinionModel.findOne({
        "userId" : userId,
        "status":1,
        "readStatus" : 0
    }, function(err, data) {
         conn.close();
         var hasNotReadReply = true;
         if(data == null){
             hasNotReadReply = false;
         }
          console.log("app.hasNotReadReply end");
         Response.end(JSON.stringify({
             "status":"0",
             "hasNotReadReply":hasNotReadReply,
             "msg":"查询成功"
         }));
    });
}

exports.Runner = run;

