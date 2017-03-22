var MEAP=require("meap");
var mongoose = require("mongoose");
var appSchema = require("../AppSchema.js");

function run(Param, Robot, Request, Response, IF)
{
	console.log("app.getUserMsgPushStatus start");
    Response.setHeader("Content-Type", "text/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var reg = new RegExp(userId);
    var conn = mongoose.createConnection(global.mongodbURL);
    var appUserMsgPushStatusModel = conn.model("app_user_msgpush_status",appSchema.appUserMsgPushStatusSchema);
    appUserMsgPushStatusModel.findOne({"userId":reg},function(err,data){
        conn.close();
        var open = true;
        if(data != null && data.status == 0){
            open = false;
        }
        console.log("app.getUserMsgPushStatus end");
        Response.end(JSON.stringify({
            "status":"0",
            "open":open,
            "msg":""
        }));
    });
}

exports.Runner = run;


                                

	

