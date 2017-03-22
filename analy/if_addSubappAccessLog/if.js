var MEAP=require("meap");
var mongoose = require("mongoose");
var analySchema = require("../AnalySchema.js");
var async = require("async");

/**
 * 添加子应用访问日志
 * @author donghua.wang
 * @date 2016年3月15日 09:09
 * */
function run(Param, Robot, Request, Response, IF)
{
    console.log("analy.addSubappAccessLog start");
    Response.setHeader("Content-Type","text/json;charset=utf-8");
    Response.end(JSON.stringify({
        "status":"0",
        "msg":"开始添加子应用访问日志"
    }));
    
    var arg = JSON.parse(Param.body.toString());
    var appId = arg.appId;
    var appName = arg.appName;
    var userId = arg.userId;
    var times = Date.now();
    
    async.waterfall([
        //获取appName
        function(cb){
            if(!appName){
                //根据appId查询appName
                var option = {
                     CN : "Dsn=mysql-emm",
                     sql:"SELECT name from AppBaseInfo where appId ='" + appId + "'"
                };
                MEAP.ODBC.Runner(option,function(err,rs,cols){
                    if(!err && rs.length > 0){
                        cb(null,rs[0].name);
                    }else{
                        console.log("查询子应用信息失败");
                        cb(-1,"查询子应用信息失败");
                    }
                })                               
            }else{
                cb(null,appName);
            }
        },
        //记载analy_subapp_access_log日志
        function(appName,cb){
            var conn = mongoose.createConnection(global.mongodbURL);
            var analySubappAccessLogModel = conn.model("analy_subapp_access_log",analySchema.AnalySubappAccessLogSchema);
            var analySubappAccessLog = new analySubappAccessLogModel({
                "appId":appId,
                "appName":appName,
                "userId":userId,
                "createTime":times
            });
            analySubappAccessLog.save(function(err){
                conn.close();
                cb(err,null);
            });       
        }
    ],function(err,data){
        if(!err){
            console.log("insert analy_subapp_access_log success.");
        }else{
            console.log("insert analy_subapp_access_log failed.");
        }
        console.log("analy.addSubappAccessLog end");
    })

}

exports.Runner = run;


                                

	

