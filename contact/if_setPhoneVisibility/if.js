var MEAP = require("meap");
var mongoose = require("mongoose");
var ContactSchema = require("../Contact.js");

/**
 * 设置手机的隐藏信息
 * @author donghua.wang
 * @date 2015年8月28日 08:28
 * */
function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type", "text/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var vis = arg.vis;
    try {
        var conn = mongoose.createConnection(global.mongodbURL);
        var userModel = conn.model("base_user", ContactSchema.BaseUserSchema);
         var regExp = new RegExp(userId);
        userModel.update({
            "PERNR" : regExp
        }, {
            "ZZ_TEL_VIS" : vis
        }, function(err) {
            conn.close();
            Response.end(JSON.stringify({
                "status" : "0",
                "msg" : "设置成功"
            }));
        });
    } catch(e) {
        console.log("设置手机可见性失败",e);
        Response.end(JSON.stringify({
                "status" : "-1",
                "msg" : "设置失败"
            }));
    }
}

exports.Runner = run;

