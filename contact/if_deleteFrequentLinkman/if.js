var MEAP = require("meap");
var mongoose = require("mongoose");
var ContactSchema = require("../Contact.js");

/**
 * 删除常用联系人
 * @author donghua.wang
 * @date 2016年3月4日 17:54
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("contact.deleteFrequentLinkman start");
    Response.setHeader("Content-Type", "text/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var linkmanId = arg.linkmanId;
    var conn = mongoose.createConnection(global.mongodbURL);
    var frequentLinkmanModel = conn.model("contact_frequent_linkman", ContactSchema.FrequentLinkmanSchema);
    frequentLinkmanModel.update({
        "userId" : userId,
        "linkmanId" : linkmanId
    },{
		"status":0,
		"deleteTime":Date.now()
	}, function(err) {
        conn.close();
		console.log("contact.deleteFrequentLinkman end");
        Response.end(JSON.stringify({
            "status":"0",
            "msg":"删除成功"
        }));
    });
}

exports.Runner = run;

