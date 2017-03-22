var MEAP=require("meap");
var async = require("async");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var meetSchema = require("../meetSchema.js");

/**
 * 判断登陆用户是否为管理员
 * @author donghua.wang
 * @version 2015年2月7日09:44
 * */
function run(Param, Robot, Request, Response, IF)
{    
	var arg = JSON.parse(Param.body.toString());
	var db = mongoose.createConnection(global.mongodbURL);
	var meetRoomModel = db.model("meetRoom", meetSchema.MeetRoomSchema);
    meetRoomModel.findOne({admin:{$elemMatch:{userId:arg.userId}}},function(err,data){
        Response.setHeader("Content-type","text/json;charset=utf-8");
        db.close();
        if(!err){
            if(data != null){
                Response.end(JSON.stringify({
                "status":"0",
                "msg":"查询成功",
                "isAdmin":"1"
            }));
            }else{
                Response.end(JSON.stringify({
                "status":"0",
                "msg":"查询成功",
                "isAdmin":"0"
            }));
            }
        }else{
            Response.end(JSON.stringify({
                "status":"-1",
                "msg":"查询失败"
            }));
        }
    });
}

exports.Runner = run;


                                

	

