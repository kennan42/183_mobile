var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../carpoolSchema.js");
/**
 *
 * 根据ID查询Car
 * 
 * 
 */
function run(Param, Robot, Request, Response, IF)
{
    var arg=JSON.parse(Param.body.toString());
    var db=mongoose.createConnection(global.mongodbURL);
    var CarpoolCarModel=db.model("carpoolcar",sm.CarpoolCarSchema);
    var CarpoolAttachmentModel = db.model("carpoolAttachment",sm.CarpoolAttachmentSchema);
    CarpoolCarModel.find({_id:arg.carId}).populate("carImg").exec(function(err,data){
        db.close();
        if(!err){
           Response.setHeader("Content-type","text/json;charset=utf-8");
           Response.end(JSON.stringify({
               status:0,
               msg:"查询成功",
               car:data
           }));
        }
    });
}

exports.Runner = run;


                                

	

