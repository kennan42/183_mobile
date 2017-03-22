var MEAP=require("meap");
var mongoose = require("mongoose");
var bcardSchema = require("../bcardSchema.js");

/**
 * 记录微信名片使用日志
 * @author donghua.wang
 * @date 2016年2月18日 15:11
 * */
function run(Param, Robot, Request, Response, IF)
{
    console.log("bcard.addWeinxinBcardUseLog start");
    Response.setHeader("Content-Type","text/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    if(userId == null){
        Response.end(JSON.stringify({
            "status":"-1"
        }));
        return;
    }
    
    var pageName = arg.pageName;
    var pageNameDesc = arg.pageNameDesc;
    var action = arg.action;
    var actionDesc = arg.actionDesc;
    var times = Date.now();
    
    var conn = mongoose.createConnection(global.mongodbURL);
    var bcardWeinxinFuncUseLogModel = conn.model("bcard_weixin_func_use_log",bcardSchema.bcardWeinxinFuncUseLogSchema);
    var bcardWeinxinFuncUseLog = new bcardWeinxinFuncUseLogModel({
        "pageName":pageName,
        "pageNameDesc":pageNameDesc,
        "action":action,
        "actionDesc":actionDesc,
        "userId":userId,
        "createTime":times
    });
    bcardWeinxinFuncUseLog.save(function(err){
        console.log("bcard.addWeinxinBcardUseLog end",err);
        conn.close();
        Response.end(JSON.stringify({
            "status":"0"
        }));
    });
}

exports.Runner = run;


                                

	

