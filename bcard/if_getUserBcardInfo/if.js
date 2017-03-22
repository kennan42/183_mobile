var MEAP = require("meap");
var mongoose = require("mongoose");
var bcardSchema = require("../bcardSchema.js");

/**
 * 查询个人名片详情
 * @author donghua.wang
 * @date 2015年12月9日 14:12
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("bcard.getUserBcardInfo start");
    Response.setHeader("Content-Type", "text/json;charset=utf-8");
    try {
        var arg = JSON.parse(Param.body.toString());
        var userBcardId = arg.userBcardId;
        var conn = mongoose.createConnection(global.mongodbURL);
        var bcardUserModel = conn.model("bcard_user", bcardSchema.bcardUserSchema);
        bcardUserModel.findById(userBcardId, function(err, doc) {
            conn.close();
            console.log("bcard.getUserBcardInfo end");
            if (!err && doc != null) {
                Response.end(JSON.stringify({
                    "status" : "0",
                    "data" : doc,
                    "msg" : "查询名片详情成功"
                }));
            } else {
                Response.end(JSON.stringify({
                    "status" : "-1",
                    "msg" : "查询名片详情失败"
                }));
            }
        });
    } catch(e) {
        console.log("bcard.getUserBcardInfo error", e);
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "查询名片详情失败"
        }));
    }
}

exports.Runner = run;

