var MEAP = require("meap");
var async = require("async");
var mongoose = require("mongoose");
var qxSchema = require("../qxSchema.js");

/**
 * 删除人员
 * @author donghua.wang
 * @date 2015年9月22日 14:55
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("qx.removeUserFromGroup start");
    Response.setHeader("Content-Type", "application/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var userIds = arg.userIds;
    var groupId = arg.groupId;
    var conn = mongoose.createConnection(global.mongodbURL);
    var groupModel = conn.model("qx_group", qxSchema.qxGroupSchema);
    var groupUserModel = conn.model("qx_group_user", qxSchema.qxGroupUserSchema);
    var contactModel = conn.model("qx_contact", qxSchema.qxContactSchema);
    groupModel.findOne({"groupId":groupId}, function(err, data) {
        if (!err && data != null && data.createUserId == userId) {
            groupUserModel.update({
                "groupId" : groupId,
                "userId" : {
                    "$in" : userIds
                }
            }, {
                "userStatus" : 2,
                "leaveTime" : new Date().getTime()
            }, {
                "multi" : true
            }, function(err) {
                contactModel.update({
                    "groupId" : groupId,
                    "userId" : {
                        "$in" : userIds
                    }
                }, {
                    "status" : 0
                }, {
                    "multi" : true
                });
                console.log("qx.removeUserFromGroup end");
                conn.close();
                Response.end(JSON.stringify({
                    "status" : "0",
                    "msg" : "删除成功"
                }));
            });
        } else {
            console.log("qx.removeUserFromGroup end");
            conn.close();
            Response.end(JSON.stringify({
                "status" : "-1",
                "msg" : "你无权删除用户"
            }));
        }
    });
}

exports.Runner = run;

