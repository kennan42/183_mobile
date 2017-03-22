var MEAP = require("meap");
var mongoose = require("mongoose");
var async = require("async");
var qxSchema = require("../qxSchema.js");
var contactSchema = require("../../contact/Contact.js");

/**
 * 查询群组成员
 * @author donghua.wang
 * @date 2015年9月24日 18:50
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("qx.getGroupUser start");
    Response.setHeader("Content-Type", "application/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var groupId = arg.groupId;
    var conn = mongoose.createConnection(global.mongodbURL);
    var groupUserModel = conn.model("qx_group_user", qxSchema.qxGroupUserSchema);
    var baseUserModel = conn.model("base_user", contactSchema.BaseUserSchema);
    var userIds = [];
    async.series([
    function(cb) {
        groupUserModel.find({
            "groupId" : groupId,
            "userStatus" : 1
        }).sort({
            "userId" : 1
        }).exec(function(err, data) {
            for (var i in data) {
                var userId = data[i].userId;
                if (userId.length == 7) {
                    userId = "0" + userId
                }
                userIds.push(userId);
            }
            cb(err, data);
        });
    },
    function(cb) {
        baseUserModel.find({
            "PERNR" : {
                "$in" : userIds
            }
        }, {
            "PERNR":1,
            "photoStatus" : 1,
            "photoURL" : 1,
            "photoUpdateTime" : 1,
            "_id" : 0
        }).sort({
            "PERNR" : 1
        }).exec(function(err, data) {
            cb(err, data);
        });
    }], function(err, data) {
        conn.close();
        console.log("qx.getGroupUser end");
        Response.end(JSON.stringify({
            "status" : "0",
            "users" : data[0],
            "photos" : data[1]
        }));
    });

}

exports.Runner = run;

