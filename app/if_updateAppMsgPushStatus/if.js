var MEAP = require("meap");
var async = require("async");
var mongoose = require("mongoose");
var appSchema = require("../AppSchema.js");

/**
 * 更新用户子应用信息推送接收状态
 * @author donghua.wang
 * @date 2015年8月17日 09:31
 * */
function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type", "text/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var appId = arg.appId;
	var status = arg.status;
	if (userId == null) {
    	Response.end(JSON.stringify({
    		"status":"-1",
    		"msg":"userId is null"
    	}));
		return;
    }
    var conn = mongoose.createConnection(global.mongodbURL);
    var appInstalledListModel = conn.model("app_install", appSchema.installedAppSchema);
	appInstalledListModel.update({
		"userId":userId,
		"appId":appId
	},{
		 "receveMsg" :status,
		 "updateTime":new Date().getTime()
	},function(err){
		conn.close();
		Response.end(JSON.stringify({
            "status" : "0"
        }));
	});
	
	/*
    async.parallel([
    //更新不接收消息推送的记录
    function(cb) {
        appInstalledListModel.update({
            "userId" : userId,
            "appId" : {
                "$in" : rejectAppIds
            }
        }, {
            "receveMsg" : 0,
            "updateTime":new Date().getTime()
        }, {
            "multi" : true
        }, function(err) {
            cb(null, "");
        });
    },
    //更新接收消息推送的记录
    function(cb) {
        appInstalledListModel.update({
            "userId" : userId,
            appId : {
                "$in" : receiveAppIds
            }
        }, {
            "receveMsg" : 1,
            "updateTime":new Date().getTime()
        }, {
            "multi" : true
        }, function(err) {
            cb(null, "");
        });
    }], function(err, data) {
        conn.close();
        Response.end(JSON.stringify({
            "status" : "0"
        }));
    });
	*/
}

exports.Runner = run;

