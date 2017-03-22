var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");

/**
 *查询附件
 * @author  donghua.wang
 * @version 2015年1月12日19:30 
 * */
function run(Param, Robot, Request, Response, IF)
{
	var arg = JSON.parse(Param.body.toString());
	var db = mongoose.createConnection(global.mongodbURL);
	var attachmentModel = db.model("carpoolAttachment",sm.CarpoolAttachmentSchema);
	var docId = arg.docId;
    attachmentModel.findById(docId,function(err,doc){
        db.close();
        Response.setHeader("Content-type","text/json;charset=utf-8");
        if(!err){
            Response.end(JSON.stringify({
             status:"0",
             msg:"查询成功",
             doc:doc
         }));
        }else{
            Response.end(JSON.stringify({
             status:"-1",
             msg:"查询失败"
         }));
        }
         
    });
}

exports.Runner = run;


                                

	

