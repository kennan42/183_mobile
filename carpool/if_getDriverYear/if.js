var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../carpoolSchema.js");

/**
 * 
 * 获取汽车驾龄
 * 作者:xialin
 * 时间：2016-01-19
 * 
 * 
*/
function run(Param, Robot, Request, Response, IF)
{
   var arg=JSON.parse(Param.body.toString());
   var db=mongoose.createConnection(global.mongodbURL);
   var CarpoolCreditModel=db.model("carpoolcredit",sm.CarpoolCreditSchema);
   CarpoolCreditModel.find({userId:arg.userId}).exec(function(err,data){
        db.close();
        if(!err){
            if(data!=null){
                Response.end(JSON.stringify({
                status:0,
                msg:"查询成功",
                driveYear:data.driveYear
            }));
            }else{
                Response.end(JSON.stringify({
                    status:0,
                    msg:"您还没有维护驾龄",
                    driverYear:0
                }));
            }
        }else{
            Response.end(JSON.stringify({
                status:-1,
                msg:"查询失败"
            }));
        }
   });
}

exports.Runner = run;
