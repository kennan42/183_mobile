var MEAP = require("meap");
var mongoose = require("mongoose");
var AppScheme = require("../AppSchema.js");

/**
 * 设置是否接收消息推送，对所有的子应用生效
 * @author donghua.wang
 * @date 2015年9月7日 16:58
 * */
function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type", "text/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
	var userId = arg.userId;
	if (userId == null) {
    	Response.end(JSON.stringify({
    		"status":"-1",
    		"msg":"userId is null"
    	}));
		return;
    }
    var conn = mongoose.createConnection(global.mongodbURL);
    var installedAppModel = conn.model("app_install", AppScheme.installedAppSchema);
    installedAppModel.update({
        "userId" : arg.userId
    }, {
        "receveMsg" : arg.receveMsg,
        "updateTime":new Date().getTime()
    },{
        "multi":true
    }, function(err) {
        conn.close();
        if(err){
            Response.end(JSON.stringify({
                "status":"-1",
                "msg":"修改失败"
            }));
        }else{
            Response.end(JSON.stringify({
                "status":"0",
                "msg":"修改成功"
            }));
        }
    });
}

exports.Runner = run;

