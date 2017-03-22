var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../carpoolSchema.js");
var async = require("async");

/**
 * 根据carID删除车
 * 作者：xialin
 * 时间：2016-01-19
 * 状态：完成
 */

function run(Param, Robot, Request, Response, IF)
{
	var arg=JSON.parse(Param.body.toString());
	 var db=mongoose.createConnection(global.mongodbURL);
    var CarpoolCarModel=db.model("carpoolcar",sm.CarpoolCarSchema);
    CarpoolCarModel.update({_id:arg.carId},{state:2}).exec(function(err,data){
        db.close();
        if(!err){
            Response.end(JSON.stringify({
                status:0,
                msg:"删除成功"
            }));
        }else{
            Response.end(JSON.stringify({
                status:-1,
                msg:"删除失败"
            }));
        }
    });
}


exports.Runner = run;


                                

	

