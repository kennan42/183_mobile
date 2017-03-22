var MEAP=require("meap");
var mongoose = require("mongoose");
var bcardSchema = require("../bcardSchema.js");

/**
 * 添加app端的用户行为分析
 * @author donghua.wang
 * @date 2016年3月18日 16:43
 * */
function run(Param, Robot, Request, Response, IF)
{
    console.log("bcard.addAppBcardAction start");
    Response.setHeader("Content-Type","text/json;charset=utf-8");
    
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var action = arg.action;
    
    var conn = mongoose.createConnection(global.mongodbURL);
    var analyAppBcardModel = conn.model("analy_app_bcard",bcardSchema.analyAppBcardSchema);
    var analyAppBcard = new analyAppBcardModel({
        "userId":userId,
        "action":action,
        "createTime":Date.now()
    });
    analyAppBcard.save(function(err){
        conn.close();
        Response.end(JSON.stringify({
            "status":"0",
            "msg":"成功"
        }));
    });
}

exports.Runner = run;


                                

	

