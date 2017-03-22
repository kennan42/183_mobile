var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../carpoolSchema.js");

function run(Param, Robot, Request, Response, IF)
{
    var arg = JSON.parse(Param.body.toString());   
    db = mongoose.createConnection(global.mongodbURL);
    var autoPublishTravelModel = db.model("carpoolAutoPublishTravel", sm.CarpoolAutoPublishTravelSchema);
    autoPublishTravelModel.update({_id:arg.autoPublishTravelId},{status:parseInt(arg.status)},function(err){
        db.close();
        if(!err){
            Response.end(JSON.stringify({
                status:"0",
                msg:"更新成功"
            }));
        }else{
            Response.end(JSON.stringify({
                status:"-1",
                msg:"更新失败"
            }));
        }
    });
    
}

exports.Runner = run;


                                

	

