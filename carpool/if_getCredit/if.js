var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../carpoolSchema.js");

/**
 * 
 * 获取点赞数
 * 
 * 
 */
function run(Param, Robot, Request, Response, IF)
{
   var arg=JSON.parse(Param.body.toString());
   var db=mongoose.createConnection(global.mongodbURL);
   var CarpoolCreditModel=db.model("carpoolcredit",sm.CarpoolCreditSchema);
   CarpoolCreditModel.findOne({userId:arg.userId}).exec(function(err,data){
        db.close();
        if(!err){
            if(data!=null){
                Response.end(JSON.stringify({
                status:0,
                msg:"查询成功",
                credit1:data.credit1,
                credit2:data.credit2
            }));
            }else{
                Response.end(JSON.stringify({
                    status:0,
                    msg:"您还没有点赞数",
                    credit1:0,
                    credit2:0
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
