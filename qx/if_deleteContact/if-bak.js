var MEAP = require("meap");
var mongoose = require("mongoose");
var qxSchema = require("../qxSchema.js");
var util = require("../../base/util.js");

/**
 * 删除企信通讯录
 * @author donghua.wang
 * @date  2015年9月24日 09:07
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("qx.deleteContact start");
    Response.setHeader("Content-Type", "application/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var groupId = arg.groupId;
    var conn = mongoose.createConnection(global.mongodbURL);
    var contactModel = conn.model("qx_contact", qxSchema.qxContactSchema);
    contactModel.update({
        "userId" : userId,
        "groupId":groupId
    }, {
        "status" : 0,
		"deleteTime":new Date().getTime()
    }, function(err){
        conn.close();
        console.log("qx.deleteContact end");
        Response.end(JSON.stringify({
            "status":"0",
            "msg":"删除成功"
        }));
    });
}

exports.Runner = run;

