var MEAP=require("meap");
var mongoose = require("mongoose");
var bcardSchema = require("../bcardSchema.js");

/**
 * 添加微信名片行为分析日志
 * @author donghua.wang
 * @date 2016年3月16日 16:08
 * */
function run(Param, Robot, Request, Response, IF)
{
    console.log("bcard.addWeixinBcardAction start");
    Response.setHeader("Content-Type","text/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var page = arg.page;
    var action = arg.action;
    var times = Date.now();
    if(!userId){
        Response.end(JSON.stringify({
            "status":"-1",
            "msg":"用户信息错误"
        }));
        return;
    }
    
    var conn = mongoose.createConnection(global.mongodbURL);
    var analyWeinBcardModel = conn.model("analy_weixin_bcard",bcardSchema.analyWeinBcardSchema);
    var analyWeinBcard = new analyWeinBcardModel({
        "userId":userId,
        "page":page,
        "action":action,
        "createTime":times
    });
    analyWeinBcard.save(function(err){
        conn.close();
        console.log("bcard.addWeixinBcardAction end");
        Response.end(JSON.stringify({
            "status":"0",
            "msg":"添加成功"
        }));
    });
}

exports.Runner = run;


                                

	

