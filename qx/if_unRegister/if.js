var MEAP = require("meap");
var mongoose = require("mongoose");
var qxSchema = require("../qxSchema.js");

/**
 * 注销企信用户
 * @author donghua.wang
 * @date 2015年12月25日 13:53
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("qx.unRegister start");
    Response.setHeader("Content-Type", "text/json;charset=utf-8");
    try {
        var userId = Param.baas.userId;
        var conn = mongoose.createConnection(global.mongodbURL);
        var registerModel = conn.model("qx_register", qxSchema.qxRegisterSchema);
        registerModel.remove({
            "userId" : userId
        },function(err) {
            conn.close();
            if (err) {
                Response.end(JSON.stringify({
                    "status" : "-1",
                    "msg" : "注销失败"
                }));
            } else {
                Response.end(JSON.stringify({
                    "status" : "0",
                    "msg" : "注销成功"
                }));
            }
        });
    } catch(e) {
        console.log("qx.unRegister error", e);
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "注销失败"
        }));
    }
}

exports.Runner = run;

