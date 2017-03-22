var MEAP = require("meap");
var mongoose = require("mongoose");
var async = require("async");
var baseSchema = require("../../base/BaseSchema.js");

/**
 * 查询拼车未读消息
 * 作者：xialin
 * 时间：2016-01-19
 * 状态：完成
 */


function run(Param, Robot, Request, Response, IF)
{
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var db = mongoose.createConnection(global.mongodbURL);
    var basePushMessageLogModel = db.model("basePushMessageLog", baseSchema.BasePushMessageLogSchema);
    var rs = {"carpool":0,"personalInfo":0,"driveRecord":0,"carpoolRecord":0};
    async.parallel([
        //查询是否有行程发布的未读消息
        function(callback){
             basePushMessageLogModel.findOne({
            "userId" : userId,
            "module" : "Carpool",
            "subModule":"CarpoolJourneyIssue",
            "readStatus" : 0
        }, function(err, data) {
            if (data != null) {
                rs.carpool = 1;
            } 
            callback(err, "");

        });
        },
        //查询是否有其他的未读消息
        function(callback){
             basePushMessageLogModel.findOne({
            "userId" : userId,
            "module" : "Carpool",
            "readStatus" : 0,
            "subModule":{"$ne":"CarpoolJourneyIssue"},
        }, function(err, data) {
            if (data != null) {
                rs.personalInfo = 1;
            } 
            callback(err, "");

        });
        },
        //查询个人中心是否有未读的开车记录
        function(cb){
            var arr = ["CarpoolBookSeat","CarpoolBookCancel","CarpoolJourneyRemind2"];
            basePushMessageLogModel.findOne({
                "userId":userId,
                "readStatus" : 0,
                "module" : "Carpool",
                "subModule":{"$in":arr} 
            },function(err,data){
                if(data != null){
                    rs.driveRecord = 1;
                }
                cb(err,"");
            });
        },
        //查询个人中心是否有未读的搭车记录
        function(cb){
            var arr = ["CarpoolJourneyIssueAddPassenger", "CarpoolJourneyCancel","CarpoolJourneyRemind","CarpoolpassengerChange"];
            basePushMessageLogModel.findOne({
                "userId":userId,
                "readStatus" : 0,
                "module" : "Carpool",
                "subModule":{"$in":arr} 
            },function(err,data){
                if(data != null){
                    rs.carpoolRecord = 1;
                }
                cb(err,"");
            });
        }
    ],function(err,data){
        db.close();
        Response.setHeader("Content-Type","text/json;charset=utf-8");
        if(!err){
            Response.end(JSON.stringify({
                "status":"0",
                "msg":"查询成功",
                "data":rs
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


                                

	

