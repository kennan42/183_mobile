var MEAP = require("meap");
var async = require("async");
var util = require("../util.js");

/**
 * 定时器，检查是否有新闻发布
 * @author donghua.wang
 * @date 2015年05月20日 09:32
 * */
function run(Param, Robot, Request, Response, IF) {
    var headers = Request.headers;
    var host = headers.host;
    console.log("host--->",host);
    console.log("auth success");
    Response.end("adfasdff");
    return;
    async.parallel([
    //查询是否有新闻发布
    function(cb) {
        var option = {
            CN : "Dsn=mysql-emm",
            sql : "select * from PublishContent t where t.isDelete = 0 ORDER BY t.createdAt desc limit 0,3"
        };
        MEAP.ODBC.Runner(option, function(err, rows, cols) {
            if (rows != null && rows.length > 0) {
                var currentTiems = new Date().getTime();
                for (var i in rows) {
                    var itemTimes = rows[i].createdAt.getTime();
                    //如果是5分钟之内发布的新闻，则进行消息推送
                    if (currentTiems - itemTimes < 30 * 60 * 1000) {
                        var pushArg = {
                            appId : global.appId,
                            platforms : "0,1",
                            title : rows[i].summary,
                            body : new Date().getTime() + "_" + rows[i].id + "_NEWSIssue",
                            badgeNum : 1,
                            module : "NEWS",
                            subModule : "NEWSIssue",
                            type : "remind"
                        }
                        util.broadcastMsg(pushArg);
                    }
                }
                cb(err,"publishNewsOver");
            }
        });
    }],function(err,data){
        Response.end("over");
    });
}

exports.Runner = run;

