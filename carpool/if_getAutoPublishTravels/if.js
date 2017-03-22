var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../carpoolSchema.js");
/**
 *
 * 根据用户ID查询自动发布行程
 * 
 * 
 */
function run(Param, Robot, Request, Response, IF)
{
	var arg = JSON.parse(Param.body.toString());  
    db = mongoose.createConnection(global.mongodbURL);
    var autoPublishTravelModel = db.model("carpoolAutoPublishTravel", sm.CarpoolAutoPublishTravelSchema);
    autoPublishTravelModel.find({userId:arg.userId},function(err,data){
        db.close();
        if(!err){
            Response.end(JSON.stringify({
                status:"0",
                msg:"查询成功",
                data:data
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


                                

	

