var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../carpoolSchema.js");

/**
 * 
 * 获取删除记录
 * 作者:xialin
 * 时间：2016-01-19
 * 
 * 
*/

function run(Param, Robot, Request, Response, IF) {
    try {
        var arg = JSON.parse(Param.body.toString());
        var userId = arg.userId;
        var travelId = arg.travelId;
        var db = mongoose.createConnection(global.mongodbURL);
        var carpoolRejectModel = db.model("carpoolReject", sm.CarpoolRejectSchema);
        carpoolRejectModel.findOne({rejectedUserId:userId,travle:travelId},function(err,data){
             Response.setHeader("Content-type","text/json;charset=utf-8");
            db.close();
            if(!err && data != null){
                Response.end(JSON.stringify({
                    status:"0",
                    msg:"查询成功",
                    data:data
                 }));
            }else{
                console.log("getDeletedRecord err--->",err);
                Response.end(JSON.stringify({
                    status:"-1",
                    msg:"查询失败"
                }));
            }
        });
    } catch(e) {
        console.log("getDeletedRecord e--->",e);
        Response.end(JSON.stringify({
            status:"-1",
            msg:"查询失败"
        }));
    }
}

exports.Runner = run;

