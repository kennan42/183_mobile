var MEAP = require("meap");
var mongoose = require("mongoose");
var analySchema = require("../AnalySchema.js");
var async = require("async");
var common = require("../common.js");

/**
 * 添加用户登录日志，如果是第一次登录，则记录第一次的登录日志
 * @author donghua.wang
 * @date  2016年3月14日 10:52
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("analy.addLoginLog start");
    Response.setHeader("Content-Type", "text/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var platform = arg.platform;
    var version = arg.version;
    var loginType = arg.loginType;
    var terminal = arg.terminal;
    var createTime = Date.now();
    var loginDateStr = common.date2str(new Date(), "yyyy-MM-dd hh:mm:ss");


    var conn = mongoose.createConnection(global.mongodbURL);
    async.parallel([
        saveToAnalyLogin,
        saveToAnalyFirstLogin,
        saveToAnalyLastLogin
    ],function(err,data){
        conn.close();
        Response.end(JSON.stringify({
            "status" : "0",
            "msg" : "添加登录日志成功"
        }));
    });
    
    
    function saveToAnalyLogin(cb) {
        console.log("saveToAnalyLogin start");
        var analyLoginModel = conn.model("analy_login", analySchema.AnalyLoginSchema);
        var analyLogin = new analyLoginModel({
            "userId" : userId,
            "platform" : platform,
            "version" : version,
            "loginType" : loginType,
            "terminal" : terminal,
            "createTime" : createTime
        });
        analyLogin.save(function(err, rs) {
            console.log("saveToAnalyLogin end");
            cb(err, null);
        })
    }

    function saveToAnalyFirstLogin(cb) {
        console.log("saveToAnalyFirstLogin start");
        var analyFirstLoginModel = conn.model("analy_first_login", analySchema.AnalyFirstLoginSchema);
        var hasLogined = false;
        async.series([
        function(cb) {
            analyFirstLoginModel.findOne({
                "userId" : userId
            }, function(err, doc) {
                if (doc != null) {
                    hasLogined = true;
                }
                cb(err, null);

            })
        },
        function(cb) {
            if (hasLogined) {
                cb(null, null);
            } else {//没有登录，则记录第一次的登录日志
                var loginDateStr = common.date2str(new Date(), "yyyy-MM-dd hh:mm:ss");
                var analyFirstLogin = new analyFirstLoginModel({
                    "userId" : userId,
                    "loginDateStr" : loginDateStr,
                    "createTime" : createTime
                });
                analyFirstLogin.save(function(err) {
                    cb(err, null);
                })
            }
        }], function(err) {
            console.log("saveToAnalyFirstLogin end");
            cb(err,null);
        })
    }
    
    function saveToAnalyLastLogin(cb){
        console.log("saveToAnalyLastLogin start");
        var analyLastLoginModel = conn.model("analy_last_login", analySchema.AnalyLastLoginSchema);
        var hasLogined = false;
        async.series([
            function(cb) {
                analyLastLoginModel.findOne({
                    "userId" : userId
                }, function(err, doc) {
                    if (doc != null) {
                        hasLogined = true;
                    }
                    cb(err, doc);
                });
            },
            function(cb) {
                if (hasLogined) {
                    //有登录记录,则更新原记录
                    analyLastLoginModel.update({"userId":userId},{"createTime":createTime,"loginDateStr":loginDateStr},function(err,data){
                        cb(err,data);
                    });
                } else {//没有登录，则记录第一次的登录日志
                    var analyLastLogin = new analyLastLoginModel({
                        "userId" : userId,
                        "loginDateStr" : loginDateStr,
                        "createTime" : createTime
                    });                
                    analyLastLogin.save(function(err) {
                        cb(err, null);
                    });
                }
            }
        ], function(err) {
            console.log("saveToAnalyLastLogin end");
            cb(err,null);
        });
    }

}

exports.Runner = run;

