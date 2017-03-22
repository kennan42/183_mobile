var MEAP = require("meap");
var mongoose = require("mongoose");
var ContactSchema = require("../Contact.js");
/**
 * 查询当前用户的隶属部门信息
 * @author donghua.wang
 * @date 2016年3月7日 14:04
 * */
function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type", "text/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;

    var conn = mongoose.createConnection(global.mongodbURL);
    var baseUserModel = conn.model("base_user", ContactSchema.BaseUserSchema);
    
    //查询用户的直接部门信息
    var reg = new RegExp(userId);
    baseUserModel.findOne({
        "PERNR" : reg
    }, function(err, doc) {
        conn.close();
        if (doc == null) {
            console.log("contact.getMyOrg end");
            Response.end(JSON.stringify({
                "status" : "-1",
                "msg" : "查询联系人信息失败"
            }));
        } else {
            //查询直接隶属部门信息
            var orgId = doc.ORGEH;
            var option = {
                agent : false,
                "url" : global.baseURL + "/contact/getOrgAndPersonByOrgId",
                "method" : "POST",
                "Body" : {
                    "orgId" : orgId,
                    "userId" : userId
                }
            };
            MEAP.AJAX.Runner(option, function(err, res, data) {
                var orgs = JSON.parse(data).orgs.data;
                var users = JSON.parse(data).users;
                var remarks = JSON.parse(data).remarks;
                console.log("contact.getMyOrg end");
                Response.end(JSON.stringify({
                    "status":"0",
                    "orgs":orgs,
                    "users":users,
                    "remarks":remarks
                }));
            });
        }
    });
}

exports.Runner = run;

