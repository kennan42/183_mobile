var MEAP = require("meap");
var async = require("async");
var mongoose = require("mongoose");
var qxSchema = require("../qxSchema.js");

/**
 * 退出群组
 * @author donghua.wang
 * @date  2015年9月24日 09:30
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("qx.exitGroup start");
    Response.setHeader("Content-Type", "application/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var groupId = arg.groupId;
    var conn = mongoose.createConnection(global.mongodbURL);
    async.parallel([
    //退出群组
    function(cb) {
        var groupUserModel = conn.model("qx_group_user", qxSchema.qxGroupUserSchema);
        groupUserModel.update({
            "groupId" : groupId,
            "userId" : userId
        }, {
            "userStatus" : 3,
			"leaveTime":new Date().getTime()
        }, function(err) {
            cb(err, null);
        });
    },
    //删除群组通讯录
    function(cb) {
        var contactModel = conn.model("qx_contact", qxSchema.qxContactSchema);
        contactModel.update({
            "userId" : userId,
            "groupId" : groupId
        }, {
            "status" : 0,
			"deleteTime":new Date().getTime()
        }, function(err) {
            cb(err,null);
        });
    }], function(err) {
            conn.close();
            console.log("qx.exitGroup end");
            if(err){
                Response.end(JSON.stringify({
                    "stauts":"-1",
                    "msg":"操作失败"
                }));
            }else{
                Response.end(JSON.stringify({
                    "status":"0",
                    "msg":"操作成功"
                }));
            }
    });
}

exports.Runner = run;

