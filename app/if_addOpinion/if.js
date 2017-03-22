var MEAP=require("meap");
var mongoose = require("mongoose");
var appSchema = require("../AppSchema.js");

/**
 * 添加意见反馈
 * @author donghua.wang
 * @date 2015年10月8日 09:15
 * */
function run(Param, Robot, Request, Response, IF)
{
    console.log("app.addOpinion start");
    Response.setHeader("Content-Type","application/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    if(!userId){
        Response.end(JSON.stringify({
            "status":"-1",
            "msg":"获取用户信息失败"
        }));
        return;
    }
    var userName = arg.userName;
    var opinion = arg.opinion;
    var imgs = arg.imgs;
    
    var conn = mongoose.createConnection(global.mongodbURL);
    var appOpinionModel = conn.model("app_opinion",appSchema.appOpinionSchema);
    var appOpinion = new appOpinionModel({
        "userId":userId,
        "userName":userName,
        "opinion":opinion,
        "imgs":imgs,
        "status":0,
		"readStatus":0,
        "createTime":new Date().getTime()
    });
    appOpinion.save(function(err){
        conn.close();
        console.log("app.addOpinion end");
        Response.end(JSON.stringify({
            "status":"0",
            "msg":"提交意见反馈成功"
        }));
    });
}

exports.Runner = run;


                                

	

