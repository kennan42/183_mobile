var MEAP = require("meap");
var async = require("async");
var mongoose = require("mongoose");
var qxSchema = require("../qxSchema.js");

/**
 * 向群组添加用户
 * @author  donghua.wang
 * @date    2015年9月23日 08:27
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("qx.addUserToGroup start");
    Response.setHeader("Content-Type", "application/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var users = arg.users;
    var groupId = arg.groupId;
    var conn = mongoose.createConnection(global.mongodbURL);
    var groupModel = conn.model("qx_group", qxSchema.qxGroupSchema);
    var groupUserModel = conn.model("qx_group_user", qxSchema.qxGroupUserSchema);
    groupModel.findOne({
        'groupId': groupId
    }, function(err, data) {
        if (data != null && data.groupStatus == 1) {
            var queue = async.queue(function(task, callback) {	
				groupUserModel.update({
					"groupId":groupId,
                    "userId":task.userId,
                    "userName":task.userName
				},{
					"userStatus":1,
                    "role":3,
                    "inviteUser":arg.userId,
                    "joinTime":new Date().getTime(),
                    "leaveTime":-1
				},{
					"upsert":true
				},function(err){
					callback(err,"");
				});
            }, 10);
            for (var i in users) {
                queue.push(users[i]);
            }
            queue.drain = function() {
                conn.close();
				console.log("qx.addUserToGroup end");
                Response.end(JSON.stringify({
                    "status" : "0",
                    "msg" : "添加用户成功"
                }));
            }
        } else {
            conn.close();
			console.log("qx.addUserToGroup end");
            Response.end(JSON.stringify({
                "status" : "-1",
                "msg" : "群组状态异常"
            }));
        }
    });
}

exports.Runner = run;

