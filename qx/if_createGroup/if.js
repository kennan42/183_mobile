var MEAP=require("meap");
var async = require("async");
var mongoose = require("mongoose");
var qxSchema = require("../qxSchema.js");

/**
 * 创建群组
 * @author donghua.wang
 * @date 2015年9月22日 14:00
 * */
function run(Param, Robot, Request, Response, IF)
{
    console.log("qx.createGroup start");
    Response.setHeader("Content-Type","application/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var conn = mongoose.createConnection(global.mongodbURL);
    var groupModel = conn.model("qx_group",qxSchema.qxGroupSchema);
    var groupUserModel = conn.model("qx_group_user",qxSchema.qxGroupUserSchema);
    var groupId = arg.groupId;
    async.series([
        //创建群组
        function(cb){
            var group = new groupModel({
                "groupId":groupId,
                "groupName":arg.name,
                "groupStatus":1,
                "createUserId":arg.list[0].userId,
                "createUserName":arg.list[0].userName,
                "createTime":new Date().getTime(),
                "deleteTime":-1
            });
            group.save(function(err,data){
                if(err){
                    console.log(err,"create group error");
                }
                cb(null,data);
            });
        },
        //往群里添加成员
        function(cb){
            var users = arg.list;
            addGroupUser(0,users,groupId,groupUserModel,cb);
        }
    ],function(err,data){
        conn.close();
        console.log("qx.createGroup over");
        if(err){
            Response.end(JSON.stringify({
                "status":"-1",
                "msg":"创建群组失败"
            }));
        }else{
            Response.end(JSON.stringify({
                "status":"0",
                "msg":"创建群组成功",
				"id":data[0]._id
            }));
        }
    });
}

//往群里添加用户
function addGroupUser(i,users,groupId,groupUserModel,cb){
    i =i||0;
    if(i < users.length){
        var user = users[i];
        var role = 3;
        if(i==0){
            role = 1;
        }else{
            role = 3;
        }
        var groupUser = new groupUserModel({
            "groupId":groupId,
            "userId":user.userId,
            "userName":user.userName,
            "userStatus":1,
            "role":role,
            "inviteUser":users[0].userId,
            "joinTime":new Date().getTime(),
            "leaveTime":-1
        });
        groupUser.save(function(err,data){
            i++;
            addGroupUser(i,users,groupId,groupUserModel,cb);
        });
    }else{
        cb(null,"");
    }
}

exports.Runner = run;


                                

	

