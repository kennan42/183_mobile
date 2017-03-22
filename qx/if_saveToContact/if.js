var MEAP = require("meap");
var async = require("async");
var mongoose = require("mongoose");
var qxSchema = require("../qxSchema.js");

/**
 * 将群组保存到通讯录
 * @author donghua.wang
 * @date 2015年9月23日 16:09
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("qx.saveToContact start");
    Response.setHeader("Content-Type", "application/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;                //保存人的id
    var groupId = arg.groupId;
    var groupName = arg.groupName;
    var createUserId = arg.createUserId;   //群主
    var createUserName = arg.createUserName;  //群主名称

    var conn = mongoose.createConnection(global.mongodbURL);
    var groupModel = conn.model("qx_group", qxSchema.qxGroupSchema);
    var contactModel = conn.model("qx_contact", qxSchema.qxContactSchema);

    groupModel.findOne({
        "groupId" : groupId,
        "groupStatus" : 1
    }, function(err, doc) {
        if (!err) {
            if (doc == null) {
                //如果查找不到，说明该群组已经删掉或不存在
                var groupEntiy = new groupModel({
                    "groupId" : groupId,
                    "groupName" : groupName,
                    "groupStatus" : 1,
                    "createUserId" : createUserId,
                    "createUserName" : createUserName,
                    "createTime" : new Date().getTime(),
                    "deleteTime" : -1
                });
                groupEntiy.save(function(err, data) {
                    //保存群组，再保存通讯录群组表
                    if (!err) {
                        var id = data._id;
                        //如果已经存在，直接保存通讯录群组
                        contactModel.update({
                            "userId" : userId,
                            "groupId" : groupId,
                            "group" : id

                        }, {
                            "userId" : userId,
                            "groupId" : groupId,
                            "group" : id,
                            "status" : 1,
                            "createTime" : new Date().getTime(),
                            "deleteTime" : -1
                        }, {
                            "upsert" : true
                        }, function(err) {
                            conn.close();
                            if (err) {
                                Response.end(JSON.stringify({
                                    "status" : "-1",
                                    "msg" : "保存失败"
                                }));
                            } else {
                                Response.end(JSON.stringify({
                                    "status" : "0",
                                    "msg" : "保存成功"
                                }));
                            }
                        });
                    } else {
                        conn.close();
                        Response.end(JSON.stringify({
                            "status" : "-1",
                            "msg" : "保存失败"
                        }));
                    }

                });

            } else {
                var id = doc._id;
                //如果已经存在，直接保存通讯录群组
                contactModel.update({
                    "userId" : userId,
                    "groupId" : groupId,
                    "group" : id

                }, {
                    "userId" : userId,
                    "groupId" : groupId,
                    "group" : id,
                    "status" : 1,
                    "createTime" : new Date().getTime(),
                    "deleteTime" : -1
                }, {
                    "upsert" : true
                }, function(err) {
                    conn.close();
                    if (err) {
                        Response.end(JSON.stringify({
                            "status" : "-1",
                            "msg" : "保存失败"
                        }));
                    } else {
                        Response.end(JSON.stringify({
                            "status" : "0",
                            "msg" : "保存成功"
                        }));
                    }
                });

            }

        } else {
            conn.close();
            Response.end(JSON.stringify({
                "status" : "-1",
                "msg" : "查询群组信息失败"
            }));
        }

    });

}

exports.Runner = run;

