var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");

function run(Param, Robot, Request, Response, IF)
{
   var arg=JSON.parse(Param.body.toString());
   var db=mongoose.createConnection(global.mongodbURL);
   var MeetBookModel=db.model("meetBook",sm.MeetBookSchemab);
   MeetBookModel.find({_id:arg.scheduleId},function(err,data){
       db.close();
        Response.setHeader("Content-type","text/json;charset=utf-8");
       if(!err){
           Response.end(JSON.stringify({
               status:0,
               msg:"上传附件成功",
               fujianAdd:data.seatCard
           }));
       }else{
           Response.end(JSON.stringify({
               status:-1,
               msg:"上传附件失败"
           }));
       }
   });
}

exports.Runner = run;


                                

	

