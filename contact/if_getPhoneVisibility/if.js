var MEAP=require("meap");
var mongoose = require("mongoose");
var ContactSchema = require("../Contact.js");

/**
 * 获取手机的隐藏信息
 * @author donghua.wang
 * @date 2015年8月28日 09:09
 * */
function run(Param, Robot, Request, Response, IF)
{
    Response.setHeader("Content-Type","text/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var conn = mongoose.createConnection(global.mongodbURL);
    var userModel = conn.model("base_user",ContactSchema.BaseUserSchema);
    var regExp = new RegExp(userId);
    userModel.findOne({"PERNR":regExp},function(err,data){
        conn.close();
        if(data == null){
            Response.end(JSON.stringify({
                "status":"-1",
                "msg":"没有查询到用户信息"
            }));
        }else{
            var vis = 0;//不可见
        /*    if(data.ZZ_TEL_VIS != null && data.ZZ_TEL_VIS == 1){//可见
                vis = 1;
            }
            if(data.ZZ_TEL_VIS == null){//未设置
                vis = -1;
            }*/
           
           if(data.ZZ_TEL_VIS==1){
               //可见
                vis = 1;
            }
           
           
            if(data.ZZ_TEL_VIS == 3){//未设置
                vis = -1;
            }
           
           
           
            Response.end(JSON.stringify({
                "status":"0",
                "vis":vis
            }));
        }
    })
}

exports.Runner = run;


                                

	

