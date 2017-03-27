var MEAP = require("meap");
var mongoose = require("mongoose");
var async = require("async");
var contactSchema = require("../Contact.js");

/**
 * 查询联系人详情
 * @author donghua.wang
 * @date 2015年9月1日 18:55:31
 * 1查询详情
 * 2查询头像
 * 3查询是否安装了天信客户端
 * */
function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type", "text/json;charset=utf8");
    console.log("===========================")
    console.log("arg", arg);
    console.log("ip", Request.headers['x-forwarded-for'] ||
        Request.connection.remoteAddress ||
        Request.socket.remoteAddress ||
        Request.connection.socket.remoteAddress);
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var linkmanId = arg.linkmanId;
    var regExp = new RegExp(linkmanId);
    var conn = mongoose.createConnection(global.mongodbURL);
    var userModel = conn.model("base_user", contactSchema.BaseUserSchema);
    var userRemarkModel = conn.model("contact_user_remark", contactSchema.ContactUserRemarkSchema);
    async.parallel([
        //查询联系人详情
        function(cb) {
            userModel.findOne({
                "PERNR": regExp
            }, function(err, data) {
                if (err) {
                    console.log(err, "查询联系人详情失败");
                }

                if (data.photoNewStatus != null) {

                    data.photoURL = data.photoNewURL;
                    data.photoURL2 = data.photoNewURL;
                }
                cb(err, data);
            });
        },
        //查询联系人备注
        function(cb) {
            userRemarkModel.findOne({
                "userId": userId,
                "linkmanId": regExp
            }, function(err, data) {
                if (err) {
                    console.log(err, "查询联系人备注失败");
                }

                cb(err, data);
            });
        },
        //查询是否安装了天信客户端
        /* function (cb) {
             var tmp = linkmanId;
             if (tmp.length == 8) {
                 tmp = tmp.substr(1);
             }
             var option = {
                 CN: "Dsn=mysql-emm",
                 sql: " select * from BindUser where appId =  '" + global.appId + "' and userId = '" + tmp + "' limit 0,1 "
             };
             MEAP.ODBC.Runner(option, function (err, rows, cols) {
                 if (err) {
                     console.log(err, "查询是否安装了天信客户端失败");
                 }
                 cb(err, rows);
             });
         },*/
        //查询是否为常用联系人
        function(cb) {
            var frequentLinkmanModel = conn.model("contact_frequent_linkman", contactSchema.FrequentLinkmanSchema);
            frequentLinkmanModel.findOne({
                "userId": userId,
                "linkmanId": linkmanId,
                "status": 1
            }, function(err, doc) {
                cb(err, doc);
            });
        }
    ], function(err, data) {
        conn.close();
        if (err) {
            Response.end(JSON.stringify({
                "status": "-1",
                "msg": "查询失败"
            }));
        } else {
            var remarkInfo = data[1];
            var remark = "";
            if (remarkInfo != null) {
                remark = remarkInfo.remark;
            }
            var installApp = false;
            if (data[2] != null && data[2].length > 0) {
                installApp = true;
            }
            Response.end(JSON.stringify({
                "status": "0",
                "userDetail": data[0],
                "remark": remark,
                "installApp": installApp,
                "frequentLinkman": data[3] == null ? false : true
            }));
            addOpLog(arg);
        }
    });
}

//记录操作类型
function addOpLog(arg) {
    var userId = arg.userId;
    var linkmanId = arg.linkmanId;
    var conn = mongoose.createConnection(global.mongodbURL);
    var userModel = conn.model("base_user", contactSchema.BaseUserSchema);
    var regExp = new RegExp(linkmanId);
    userModel.findOne({
        "PERNR": regExp
    }, function(err, data) {
        if (!err && data != null) {
            var userName = data.NACHN;
            var actionAnalyModel = conn.model("contact_action_log", contactSchema.ContactActionLogSchema);
            var actionAnaly = new actionAnalyModel({
                "userId": userId,
                "argId": linkmanId,
                "argName": userName,
                "opType": "queryUser",
                "opTime": new Date().getTime()
            });
            actionAnaly.save(function(err) {
                conn.close();
                console.log("add queryOrg about user log over");
            });
        } else {
            conn.close();
            console.log("");
        }
    });
}
exports.Runner = run;
