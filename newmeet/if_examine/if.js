var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");
var async = require("async");

function run(Param, Robot, Request, Response, IF)
{
	var arg=JSON.parse(Param.body.toString());
	var pageNumber = parseInt(arg.pageNum);
    var pageSize = parseInt(arg.pageSize);
    var skipNumber = (pageNumber - 1)*pageSize;
	Response.setHeader("Content-type","text/json;charset=utf-8");
    
    var state = arg.state;
    var query = {};
    if(state == '0'){//未审核   1
        query = {needApply:1,state:1,checkUser:{$elemMatch:{userId:arg.userId}}};
    }else if(state == '1'){//已审核
        query = {needApply:1,state:{$in:[2,3,5,6]},checkUser:{$elemMatch:{userId:arg.userId}}};
    }else{
        Response.end(JSON.stringify({
            status:"-1",
            msg:"参数传递错误"
        }));
    }
    var db=mongoose.createConnection(global.mongodbURL);
    var MeetBookModel=db.model("meetBook",sm.MeetBookSchema);
	var  q = MeetBookModel.find(query);
	if(state == '0'){
		q.sort({userName2:1,userId:1,createTime:-1});
	}else{
		q.sort({createTime:-1});
	}
    q.skip(skipNumber).limit(pageSize).exec(function(err,data){
        if(!err){
            MeetBookModel.count(query,function(err,count){
            db.close();
            Response.end(JSON.stringify({
                status:"0",
                msg:"查询成功",
                data:data,
                count:count
            }));
        });
        }else{
            db.close();
            Response.end(JSON.stringify({
                status:"-1",
                msg:"查询失败"
            }));
        }
    });
}

exports.Runner = run;


                                

	

