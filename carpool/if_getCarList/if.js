var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../carpoolSchema.js");

/**
 * 爱车页面中，查询车辆列表
   作者：xialin
   时间：2016-4-6
 */
function run(Param, Robot, Request, Response, IF)
{
	var arg=JSON.parse(Param.body.toString());
	
	var db=mongoose.createConnection(global.mongodbURL);
	var CarpoolCarModel=db.model("carpoolcar",sm.CarpoolCarSchema);
	var CarpoolAttachmentModel = db.model("carpoolAttachment",sm.CarpoolAttachmentSchema);
	
	var query ={carOwnerId:arg.userId,company:arg.company,state:1};
	
	CarpoolCarModel.find(query).populate("carImg").exec(function(err,data){
        db.close();
        Response.setHeader("Content-type","text/json;charset=utf-8");
        if(!err){
            Response.end(JSON.stringify({
                status:0,
                msg:"查询成功",
				msgStatus:"S4000111",
                cars:data
            }));
        }else{
            Response.end(JSON.stringify({
                status:-1,
				msgStatus:"E4000119",
                msg:"查询失败"
            }));
        }
    });
}

exports.Runner = run;


                                

	

