var MEAP = require("meap");
var async = require("async");
var util = require("../util.js");
var jpushUtil = require("../../jpush2/jpush_util.js");

/**
 * 定时器，检查是否有新闻发布
 * @author donghua.wang
 * @date 2015年05月20日 09:32
 * */
function run(Param, Robot, Request, Response, IF) {
    var headers = Request.headers;
    var host = headers.host;
    if (host.indexOf("localhost") == -1) {
        Response.end("not auth");
        return;
    }
    Response.end("over");

    async.series([
    //查询是否有新闻发布
    function(cb) {
        var option = {
            CN : "Dsn=mysql-emm",
            sql : " SELECT a.id,a.createdAt,a.summary,a.content,b.title FROM PublishContent a,Programa b" + " WHERE a.programaId = b.id AND a.isDelete = 0 ORDER BY a.createdAt DESC LIMIT 0,3"
        };
        MEAP.ODBC.Runner(option, function(err, rows, cols) {
            if (rows != null && rows.length > 0) {
                var currentTiems = new Date().getTime();
				var date1 = new Date();
				date1.setTime(currentTiems);
				date1.setSeconds(0);
				date1.setMilliseconds(0);
				var times = date1.getTime();
                var rs = [];
                for (var i in rows) {
                    var itemTimes = rows[i].createdAt.getTime();
                    //如果是30分钟之内发布的新闻，则进行消息推送
                    if (times - itemTimes < 32 * 60 * 1000 && times - itemTimes >= 30 * 60 * 1000) {
                        rs.push(rows[i]);
                    }
                }
                if (rs.length > 0) {
                    pushMsg(rs);
                }
            }
        });
    }], function(err, data) {

    });
}

function pushMsg(news) {
    var userIds = [];
    async.series([
    //查询推送用户
    function(cb) {
        var option = {
            CN : "Dsn=mysql-emm",
            sql : "select distinct(userId) from BindUser"
        };
        MEAP.ODBC.Runner(option, function(err, rows, cols) {
			for(var i in rows){
				userIds.push(rows[i].userId);
			}		
            cb(null, "");
        });
    },
    //推送消息
    function(cb) {
            for (var j in news) {
                var pushArg = {
                    appId : global.appId,
                    platforms : "0,1",
                    title : news[j].title + ": " + news[j].summary,
                    body : new Date().getTime()  + "_NEWSIssue",
                    userIds : userIds,
                    badgeNum : 3,
                    module : "NEWS",
                    subModule : "NEWSIssue",
                    type : "remind"
                };
               // util.pushMsg(pushArg);
			   var jpushArg = {
				   userid:"tianxin",
				   userList:userIds,
				   title:"",
				   content:pushArg.title,
				   type:0,
				    msgType : "NEWS",
                    subModule : "NEWSIssue"
				  
			   };
			   jpushUtil.jpush(jpushArg);
            }
    }]);
}

exports.Runner = run;

