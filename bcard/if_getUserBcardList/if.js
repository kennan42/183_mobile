var MEAP = require("meap");
var mongoose = require("mongoose");
var bcardSchema = require("../bcardSchema.js");

/**
 * 查询用户名片
 * @author donghua.wang
 * @date 2015年12月3日 16:20
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("bcard.getUserBcardList start");
    Response.setHeader("Content-Type", "text/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;

    var conn = mongoose.createConnection(global.mongodbURL);
    var bcardUserModel = conn.model("bcard_user", bcardSchema.bcardUserSchema);
    bcardUserModel.find({
        "userId" : userId
    }, {
        "bcardURL" : 1,
        "bcardBackgroudURL":1,
        "contactErweimaURL":1,
        "userName" : 1,
        "job" : 1,
        "bcardName":1
    }).sort({
        "creatTime" : -1
    }).exec(function(err, data) {
        conn.close();
        Response.end(JSON.stringify({
            "status" : "0",
            "data" : data
        }));
    });
}

exports.Runner = run;

