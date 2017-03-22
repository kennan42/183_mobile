var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../BaseSchema.js");

function run(Param, Robot, Request, Response, IF)
{
    var db = mongoose.createConnection(global.mongodbURL);
    var BaseFestivalModel = db.model("baseFestival",sm.BaseFestivalSchema);
    BaseFestivalModel.findOne({appId:"tianxin",expireDate:{$gte:new Date().getTime()}},function(err,doc){
        db.close();
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if(!err && doc != null){
            Response.end(JSON.stringify({
                status:"0",
                url:doc.imageURL
            }));
        }else{
            Response.end(JSON.stringify({
                status:"-1"
            }));
        }
    });
}

exports.Runner = run;


                                

	

