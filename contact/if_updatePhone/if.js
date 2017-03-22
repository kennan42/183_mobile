var MEAP = require("meap");
var mongoose = require("mongoose");
var contactSchema = require("../Contact.js");

/**
 * 根据用户ID修改手机号
 *
 * @param Param
 * @param Robot
 * @param Request
 * @param Response
 * @param IF
 */
function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type", "text/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());

    var userId = arg.userId;
    var phoneNum = arg.phoneNum;
    if (!(userId && phoneNum)) {
        Response.end(JSON.stringify({
            status: 1,
            msg: "参数错误"
        }));
        return;
    }

    var conn = mongoose.createConnection(global.mongodbURL);
    var userModel = conn.model("base_user", contactSchema.BaseUserSchema);
    if (userId.length < 8) {
        userId = "0" + userId;
    }
    userModel.update({
        "PERNR": userId
    }, {
        "ZZ_TEL": phoneNum
    }, function (err, raw) {
        conn.close();
        if (err) {
            Response.end(JSON.stringify({
                status: 2,
                msg: "更新失败"
            }));
        } else {
            Response.end(JSON.stringify({
                status: 0,
                msg: "更新成功"
            }));
        }
    });
}

exports.Runner = run;

