var MEAP = require("meap");
var async = require("async");
var mongoose = require("mongoose");
var qxSchema = require("../qxSchema.js");

/**
 * 解散群
 * @author donghua.wang
 * @date 2015年9月22日 17:27
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("qx.dismissGroup start");
    Response.setHeader("Content-Type", "application/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var groupId = arg.groupId;
    var conn = mongoose.createConnection(global.mongodbURL);
    var groupModel = conn.model("qx_group", qxSchema.qxGroupSchema);
   
    async.series([
    //验证用户角色，是否为管理员
    function(cb) {
        groupModel.find({"groupId":groupId}, function(err, data) {
            if (data != null && data.length > 0 && data[0].createUserId == userId) {
                cb(null, "");
            } else {
                cb("-1", "");
            }
        });
    },
    //更新群状态
    function(cb) {
        groupModel.update({
            "groupId" : groupId
        }, {
            "groupStatus" : 2,
            "deleteTime" : new Date().getTime()
        }, function(err) {
            cb(err, null);
        });
    },
   
    //更新通讯录状态
    function(cb) {
        var contactModel = conn.model("qx_contact", qxSchema.qxContactSchema);
        contactModel.update({
            "groupId" : groupId
        }, {
            "status" : 0,
            "deleteTime":new Date().getTime()
        }, {
            "multi" : true
        }, function(err) {
            cb(err, null);
        });
    }], function(err, data) {
        conn.close();
        console.log("qx.dismissGroup end");
        if (err) {
            Response.end(JSON.stringify({
                "status" : "-1",
                "msg" : "只有管理员才能解散群组"
            }));
        } else {
            Response.end(JSON.stringify({
                "status" : "0",
                "msg" : "解散群组成功"
            }));
        }
    });
}

exports.Runner = run;

