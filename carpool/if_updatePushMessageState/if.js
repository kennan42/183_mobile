var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../carpoolSchema.js");
/**
 * 费接口
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param, Robot, Request, Response, IF)
{
    var arg = JSON.parse(Param.body.toString());
    var appId = arg.appId;
    var userId = arg.userId;
    	
    var db = mongoose.createConnection(global.mongodbURL);
    var pusuMessageModel = db.model("commonPushMessage",sm.CommonPushMessageSchema);	
    pusuMessageModel.update({appId:appId,userId:userId},{badgeNum:0},function(err){
        db.close();
        if(!err){
            Response.end(JSON.stringify({
                status:"0"
            }));
        }else{
            Response.end(JSON.stringify({
                status:"-1"
            }));
        }
    });
}

exports.Runner = run;


                                

	

