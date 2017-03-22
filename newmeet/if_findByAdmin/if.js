var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");
var guishudi=[];

function run(Param, Robot, Request, Response, IF)
{
	// var arg=JSON.parse(Param.body.toString());
	var db=mongoose.createConnection(global.mongodbURL);
	var MeetGuishudiModel=db.model("meetguishudi",sm.MeetGuishudiSchema);
    MeetGuishudiModel.find({admin:{$elemMatch:{userId:"8104017"}}},function(err,data){
        db.close();
        Response.setHeader("Content-type","text/json;charset=utf-8");
        if(!err){
            for(var s in data){
                guishudi[s]={code:data[s].code,name:data[s].name};
            }
           Response.end(JSON.stringify({
               guishudi:guishudi
           }));
        }else{
             Response.end(JSON.stringify({
               status:-1
           }));
        }
    });
}

exports.Runner = run;


                                

	

