var MEAP = require("meap");
var async = require("async");
var mongoose = require("mongoose");
var qxSchema = require("../qxSchema.js");

/**
 * 更新群名字
 * @author donghua.wang
 * @date 2015年9月22日 17:27
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("qx.updateGroupName start");
    Response.setHeader("Content-Type", "application/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var groupId = arg.groupId;
    var groupName = arg.groupName;
    var userId = arg.userId;
    if (groupName == null || groupName == "") {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "群组名字不能为空"
        }));
        return;
    }
    var conn = mongoose.createConnection(global.mongodbURL);
    var groupModel = conn.model("qx_group", qxSchema.qxGroupSchema);
    
    async.series([
    //判断人员权限
    function(cb) {
       groupModel.find({"groupId":groupId,"groupStatus": 1}, function(err, data) {
            if (data != null && data.length > 0 && data[0].createUserId == userId) {
                cb(null, "");
            } else {
                cb("-1", "");
            }
        });
    },

    //修改群组名称
    function(cb) {
        groupModel.update({
            "groupId" : groupId
        }, {
            "groupName" : groupName
        }, function(err) {
            cb(err, null);
        });
    }], function(err, data) {
        conn.close();
        if (err) {
            Response.end(JSON.stringify({
                "status" : "-1",
                "msg" : "修改失败"
            }));
        } else {
            Response.end(JSON.stringify({
                "status" : "0",
                "msg" : "修改成功"
            }));
        }
    });

}

exports.Runner = run;

