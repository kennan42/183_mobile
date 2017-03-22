var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../BaseSchema.js");

function run(Param, Robot, Request, Response, IF)
{
    var arg = JSON.parse(Param.body.toString());
    var uniqueFlag = arg.uniqueFlag;
    	
    var db = mongoose.createConnection(global.mongodbURL);
    var pusuMessageLogModel = db.model("basePushMessageLog",sm.BasePushMessageLogSchema);	
    pusuMessageLogModel.update({uniqueFlag:uniqueFlag},{readStatus:1},function(err){
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


                                

	

