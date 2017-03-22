var MEAP=require("meap");
var mongoose = require("mongoose");
var bcardSchema = require("../bcardSchema.js");

/**
 * 添加微信名片夹页面访问时间记录
 * @author donghua.wang
 * @date 2016年3月19日 14:55
 * */
function run(Param, Robot, Request, Response, IF)
{
    console.log("bcard.addWeixinPageVisitTime start");
    Response.setHeader("Content-Type", "text/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var page = arg.page;
    var startTime = arg.startTime;
    var endTime = arg.endTime;
    var stayTime = arg.stayTime;
    var times = Date.now();
    
    var conn = mongoose.createConnection(global.mongodbURL);
    var model = conn.model("analy_weixin_bcard_pagevisit_time",bcardSchema.analyWeixinBcardPageVisitTimeSchema);
    var analyWeixinBcardPageVisitTime = new model({
        "userId":userId,
        "page":page,
        "startTime":startTime,
        "endTime":endTime,
        "stayTime":stayTime,
        "createTime":times
    });
    analyWeixinBcardPageVisitTime.save(function(err){
        conn.close();
        Response.end(JSON.stringify({
            "status":"0",
            "msg":"添加成功"
        }));
    });
}

exports.Runner = run;


                                

	

