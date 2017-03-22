var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../carpoolSchema.js");

/**
 * 
 * 删除自动发布行程ID
 * 作者：xialin
 * 时间：2016-01-19
 * 状态:完成
 */

function run(Param, Robot, Request, Response, IF)
{
    var arg = JSON.parse(Param.body.toString());   
    db = mongoose.createConnection(global.mongodbURL);
    var autoPublishTravelModel = db.model("carpoolAutoPublishTravel", sm.CarpoolAutoPublishTravelSchema);
    autoPublishTravelModel.remove({_id:arg.autoPublishTravelId},function(err){
        db.close();
        if(!err){
            Response.end(JSON.stringify({
                status:"0",
                msg:"删除成功"
            }));
        }else{
            Response.end(JSON.stringify({
                status:"-1",
                msg:"删除失败"
            }));
        }
    });
}

exports.Runner = run;


                                

	

