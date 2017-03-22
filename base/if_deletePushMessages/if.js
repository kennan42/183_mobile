var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../BaseSchema.js");

function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var delType = arg.delType;
    var condition = {};
    if(delType == "ALL"){
        condition = {
            userId:arg.userId,
            appId:arg.appId
        };
    }else if(delType == "BYID"){
        condition = {
            _id:{$in:arg.messagesIds}
        };
    }else{
         Response.end(JSON.stringify({
                status:"-1",
                msg:"传递参数非法"
            }));
            return;
    }
    
    var db = mongoose.createConnection(global.mongodbURL);
    var pusuMessageLogModel = db.model("basePushMessageLog", sm.BasePushMessageLogSchema);
    pusuMessageLogModel.remove(condition,function(err){
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

