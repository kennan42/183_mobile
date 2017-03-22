var MEAP = require("meap");
var mongoose = require("mongoose");
var bcardSchema = require("../bcardSchema.js");

/**
 * 根据uuid查询个人名片
 * @author donghua.wang
 * @date 2015年12月24日 09:36
 * */
function run(Param, Robot, Request, Response, IF) {
    try {
        console.log("bcard.findBcardByUUID start");
        Response.setHeader("Content-Type","text/json;charset=utf-8");
        var uuid = Param.baas.uuid;
        var conn = mongoose.createConnection(global.mongodbURL);
        var bcardModel = conn.model("bcard_user", bcardSchema.bcardUserSchema);
        bcardModel.findOne({
            "uuid" : uuid
        }, function(err, doc) {
            conn.close();
            console.log("bcard.findBcardByUUID end");
            if (err || doc == null) {
            console.log("--------------------------aaaaaaaaaaaaa-------------------------------");
                Response.end(JSON.stringify({
                    "status" : "-1",
                    "msg" : "查询名片信息失败"
                }));
            } else {
                Response.end(JSON.stringify({
                    "status" : "0",
                    "msg" : "查询名片信息成功",
                    "data" : doc
                }));
            }
        });
    } catch(e) {
        console.log("bcard.findBcardByUUID error", e);
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "查询名片信息失败"
        }));
    }

}

exports.Runner = run;

