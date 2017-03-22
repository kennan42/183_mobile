var MEAP = require("meap");
var util = require("../util.js");
function run(Param, Robot, Request, Response, IF) {
   

    Response.setHeader("Content-Type", "application/json;charset=utf8");

    var arg = JSON.parse(Param.body.toString());
  
    if (arg.title == null || arg.title == "") {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "消息标题不能为空"
        }));
        return;
    }
    if (arg.module == null || arg.module == "") {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "消息所属模块不能为空"
        }));
        return;
    }

    if (arg.subModule == null || arg.subModule == "") {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "消息所属子模块不能为空"
        }));
        return;
    }
    if (arg.userIds == null || arg.userIds == "") {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "推送用户不能为空"
        }));
        return;
    }
    if ( typeof arg.userIds != "object" || arg.userIds.length == undefined) {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "推送用户不能为空"
        }));
        return;
    }

    for (var i in arg.userIds) {
        var userId = arg.userIds[i];
        var pushArg = {
         "userCodeListStr":userId,
         "title":arg.title,
         
        "platform" : "all",
        
        "audience" : {
        "alias":[userId]
        },

        "notification" : {

        "android" : {
        "alert" : arg.title,
        //"title" : title,
        "builder_id" : 1,
        "extras" : {
        
        }
        },

        "ios" : {
        "alert" : arg.title,
        "sound" :"default",
        "badge" : "+1",
        "extras" : {
       
        }
        }
        },

        "message": {
        "msg_content": "这是推送消息",
        "content_type": "text",
        "title": "msg",
        "extras": {
        "number": "20"
        }
        },
        
        
        "options" : {
        "time_to_live" : 60,
        "apns_production" : true
    }

};

util.pushMsg(pushArg);

}

Response.end(JSON.stringify({
    "status" : "0",
    "msg" : "调用消息推送成功"
}));

}

exports.Runner = run;
