var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var MeetSchema = require("../meetSchema.js");
function run(Param, Robot, Request, Response, IF)
{
    var db=mongoose.createConnection(global.mongodbURL);
    var meetLevelModel=db.model("meetLevel",MeetSchema.MeetLevelSchema);
    meetLevelModel.find({}).sort({"code":1}).exec(function(err,data){
        db.close();
         Response.setHeader("Content-type","text/json;charset=utf-8");
        if(!err){
           Response.end(JSON.stringify({
               "status":"0",
               "msg":"查询成功",
               "data":data
           }));
        }else{
            Response.end(JSON.stringify({
               "status":"-1",
               "msg":"查询失败"
           }));
        }
    });
}

exports.Runner = run;


                                

	

