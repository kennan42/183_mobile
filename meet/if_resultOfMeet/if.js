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
    var pageNumber = parseInt(arg.pageNum);
    var pageSize = parseInt(arg.pageSize);
    var skipNumber = (pageNumber - 1)*pageSize;
    
    var query = {userId:arg.userId};
    var state = parseInt(arg.state);
    if(state == 1){
        query.state = 1;
    }else if(state == 2){
        query.state = 2;
    }else{
        query.state = {'$in':[3,4,5,6]};
    }
    MeetBookModel.count(query,function(err,count){
         var pages=Math.ceil(count/pageSize);
        MeetBookModel.find(query).skip(skipNumber).limit(pageSize).sort({startTime:1}).exec(function(err,data){
             db.close();
        Response.setHeader("Content-type","text/json;charset=utf-8");
        if(!err){
            Response.end(JSON.stringify({
                status:0,
                msg:"查询成功",
                data:data,
                pages:pages
            }));
        }else{
            Response.end(JSON.stringify({
                status:-1,
                msg:"查询失败"
            }));
        }
        });
    });
}

exports.Runner = run;


                                

    

