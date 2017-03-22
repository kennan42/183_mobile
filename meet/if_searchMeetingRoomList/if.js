var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");
var async = require("async");

/**
 * 查询会议室列表（董元）
 */
var db = null;
var arg = null;
var query = null;
var meetingRoomModel = null;
function run(Param, Robot, Request, Response, IF)
{
    arg = JSON.parse(Param.body.toString());
    res = Response;
    query = {state:{$ne:3}};
    if(arg.name != null && arg.name != ''){
         var reg = new RegExp(arg.name);
        query.name = reg;
    }
    db = mongoose.createConnection(global.mongodbURL);
    meetingRoomModel = db.model("meetRoom",sm.MeetRoomSchema);
    Response.setHeader("Content-type","text/json;charset=utf-8");
    async.parallel([getMeetingRoomList,getMeetingRoomListCount],function(err,data){
        db.close();
        if(!err){
            Response.end(JSON.stringify({
                status:"0",
                msg:"查询成功",
                data:data[0],
                count:data[1]
            }));
        }else{
            Response.end(JSON.stringify({
                status:"-1",
                msg:"查询失败"
            }));
        }
    });
}

function getMeetingRoomList(callback){
    var pageSize = parseInt(arg.pageSize);
    var pageNum = parseInt(arg.pageNum);
    var skip = (pageNum-1)*pageSize;
    meetingRoomModel.find(query).skip(skip).limit(pageSize).sort({guishudiName:1,index:1}).exec(function(err,data){
        callback(err,data);
    });
}

function getMeetingRoomListCount(callback){
    meetingRoomModel.count(query,function(err,data){
        callback(err,data);
    });
}

exports.Runner = run;


                                

    

