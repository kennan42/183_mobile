var MEAP = require("meap");
var async = require("async");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var baseSchema = require("../BasePushSchema.js");
var baseSchema2 = require("../BaseSchema.js");
//var appKey = "868c28217f56268a58b72e62";
//var MasterSecret = "189289c71ec7ff4bc8fbafc8";

var pushURL = "https://api.jpush.cn/v3/push";
var pushResult = [];

function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type", "application/json;charset=utf8");
    console.log("start jpush-->");
    var arg = JSON.parse(Param.body.toString());
    
    if (arg.userList == null || arg.userList == "") {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "推送用户不能为空"
        }));
        return;
    }
    if ( typeof arg.userList != "object" || arg.userList.length == undefined) {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "推送用户不能为空"
        }));
        return;
    }

    if (arg.content == null || arg.content == "") {
        Response.end(JSON.stringify({
            "status" : "-2",
            "msg" : "消息内容不能为空"
        }));
        return;
    }

    if (arg.userId == null || arg.userId == "") {
        Response.end(JSON.stringify({
            "status" : "-3",
            "msg" : "消息发送人不能为空"
        }));
        return;
    }
    
    if (arg.msgType == null || arg.msgType == "") {
        Response.end(JSON.stringify({
            "status" : "-4",
            "msg" : "消息类型不能为空"
        }));
        return;
    }
    
    

    //用户全部数组
    var userList = arg.userList;
    //数组长度
    var len = userList.length;
    //每次分批900人推送
    var groupSize = 900;
    //得到分组个数
    //var userGroup = Math.ceil(len / groupSize);

    var result = [];
    var base64_auth_string = new Buffer(global.jpush.appKey + ":" + global.jpush.MasterSecret);
    var base64key = base64_auth_string.toString('base64');
    
    
    //推送结果
    if (len > groupSize) {
        for (var i = 0; i < len; i += groupSize) {

            result.push(userList.slice(i, i + groupSize));
        }

    } else {
        result.push(userList);
    }

    var sendData = {
        "userId" : arg.userId,
        "platform" : "all",

        "audience" : {
            "alias" : "",
            "tag":[arg.msgType]
        },

        "notification" : {

            "android" : {
                "alert" : arg.content,
                "title" : "",
                "builder_id" : 1,
                "extras" : {

                }
            },

            "ios" : {
                "alert" : arg.content,
                "sound" : "sound.caf",
                "badge" : "+1",
                "extras" : {

                }
            }
        },

        "message" : {
            "msg_content" : arg.content,
            // "content_type" : "text",
            // "title" : "msg",
            "extras" : {
                "type" : arg.type
            }
        },

        "options" : {
            "time_to_live" :   86400*2 ,
            "apns_production" : true
        }

    }

    //推送

    async.each(result, function(ele, callback) {

        sendData.audience.alias = ele;
        
       
        var option = {
            method : "POST",
            url : pushURL,
            Cookie : "true",
            Headers : {
                "Content-Type" : "application/json",
                "Authorization" : "Basic " + base64key

            },
            Body : sendData
        };

        MEAP.AJAX.Runner(option, function(err, res, data) {

            var result = JSON.parse(data);
            console.log(111);
            console.log(JSON.stringify(result));
            console.log(2222);
            var saveArg = {

                // "userId" : arg.userId, //用户id
                // "title" : arg.title, //标题
                // "content" : arg.content, //内容
                // "msg_id" : result.msg_id, //推送返回结果msg_id
                // "status" : "0", //发送成功或失败    状态
                // "error" : "0", //出错信息
                // "ulist":ele,
                // "module":arg.msgType,
                // "readStatus" : 0 ,
                 // "subModule" : arg.subModule
                 
                 
                appId : arg.appId,
                ulist : ele,
                title : arg.title,
                body : arg.content,
                module : arg.msgType,
                subModule : arg.subModule
                 
            }
            
            
            
            

            if (result.sendno == 0) {
                //发送成功arg.userid
                console.log("send ok");

             //   saveArg.status = "0";
                Response.end(JSON.stringify({
                    "status" : "0",
                    "msg" : "推送成功"
                }));

            } else {
              //  saveArg.status = "1";
               // saveArg.error = result.error;
                Response.end(JSON.stringify({
                    "status" : "-5",
                    "msg" : "推送失敗"
                }));

            }

            savePushMsgLog2(saveArg);

        }, null);

    }, function(err) {
        console.log(err);

    });

   

}

exports.Runner = run;

//保存推送消息记录

function savePushMsgLog(arg) {

    var ulist = arg.ulist;
    var rs = [];
    var time = new Date().getTime();
    for (var i = 0; i < ulist.length; i++) {

         rs.push({
            userId : arg.userId, //用户id
            title : arg.title, //标题
            content : arg.content, //内容
            pushTime : time, //推送时间
            msg_id : arg.msg_id, //推送返回结果msg_id
            status : arg.status,
            uid : ulist[i],
            readStatus : 0 ,//阅读状态
             error:arg.error,
            module : arg.module, //
             subModule : arg.subModule
        });

    };

    var db = mongoose.createConnection(global.mongodbURL);

    var basePushMessageLogModel = db.model("JPushMessageLog", baseSchema.BasePushMessageLogSchema);

         basePushMessageLogModel.collection.insert(rs, {
        ordered : false
    }, function(err, data) {
   

        if (err) {

            console.log("保存失败");

        }
        console.log("保存OK");
        db.close();
    });

}


//保存推送消息记录(wang)
function savePushMsgLog2(arg) {

    var ulist = arg.ulist;
    var rs = [];
    var time = new Date().getTime();
    for (var i = 0; i < ulist.length; i++) {

        rs.push({

            appId : arg.appId,
            userId : ulist[i],
            title : arg.title,
            body : arg.body,
            pushTime : time,
            readStatus : 0,
            module : arg.module,
            subModule : arg.subModule
        });

    };
    var db = mongoose.createConnection(global.mongodbURL);
    var basePushMessageLogModel = db.model("basePushMessageLog", baseSchema2.BasePushMessageLogSchema);

    basePushMessageLogModel.collection.insert(rs, {
        ordered : false
    }, function(err, data) {

        if (err) {

            console.log("保存失败");

        }
        console.log("保存OK");
        db.close();
    });

}