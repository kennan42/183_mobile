var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");
var async = require("async");

function run(Param, Robot, Request, Response, IF)
{
	var arg=JSON.parse(Param.body.toString());
	var db=mongoose.createConnection(global.mongodbURL);
	var MeetBookModel=db.model("meetBook",sm.MeetBookSchema);
	var coditions=getQueryCondition(arg);
    
    
     MeetBookModel.find(coditions,function(err,data){
            db.close();
        Response.setHeader("Content-type","text/json;charset=utf-8");
        if(!err){
            Response.end(JSON.stringify({
                status:0,
                msg:"查询成功",
                data:data
            }));
        }else{
            Response.end(JSON.stringify({
                status:-1,
                msg:"查询失败"
            }));
        }
        });
    
}
function getQueryCondition(arg){
    var codition={};
    if(arg.guishudiCodeId==""&&arg.capacity==""&&arg.name==""&&arg.beginDate==0&&arg.endDate==0){
        codition={};
        return;
    }
    if(arg.guishudiCodeId!=""){
        codition["guishudiId"]=arg.guishudiCodeId;
    }
    if( arg.capacity!=""){
        codition["capacity"]=arg.capacity;
    }
    if( arg.name!=""){
        codition["name"]=arg.name;
    }
    if( arg.beginDate!=0&&arg.endDate!=0){
        var time1={};
       time1["$gte"]=arg.beginDate;
       codition["startTime"]=time1;
       var time2={};
        time2["$lte"]=arg.endDate;
       codition["startTime"]=time2;
    }
    codition["type"]=arg.type;
    codition["userId"]=arg.userId;
    return codition;
}



exports.Runner = run;


                                

	

