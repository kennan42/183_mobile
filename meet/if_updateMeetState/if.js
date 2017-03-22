var MEAP = require("meap");
var async = require('async');
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");

/**
 * 更新会议预约系统状态
 * 2016-9-20改
 * zrx
 * 会议室状态在审核中，和审核完成是：1当会议室结束的时候修改状态为5，2.当当前时间>开始时间，当前时间<结束时间时，修改状态为7
 * 5代表会议室结束，7代表会议中
 * */
function run(Param, Robot, Request, Response, IF) { 
    var db = mongoose.createConnection(global.mongodbURL);
    var meetBookModel = db.model("meetBook", sm.MeetBookSchema);
    var meetRoomModel = db.model('meetRoom', sm.MeetRoomSchema);
    var times = new Date().getTime();
    Response.setHeader("Content-type","text/json;charset=utf-8");
    async.parallel([
    //更新会议室预约状态为已完成
    function(callback) {
        meetBookModel.update({//会议结束
            state : {
                $in:[1,2,7],
            }, 
            endTime : {
                $lte : times
            }
        }, {
            $set:{
            state : 5
            }
        },{
            upsert : false,
            multi : true
        }, function(err) {
             callback(err,'');
        });
    },
        function(callback) {
        meetBookModel.update({//会议中
            state : {
                $in:[1,2],
            }, 
            endTime : {
                $gte : times
            },
            startTime:{
                $lte : times
            }
        }, {
            $set:{
            state : 7
            }
        }, {
        upsert : false,
        multi : true
        },function(err) {
             callback(err,'');
        });
    },
    //解冻过期的会议室状态
    function(callback) {
        meetRoomModel.update({
            'state':2,
            'frozenEnd':{'$lte':times}
        },{
            'state':1,
            'frozenBegin':0,
            'frozenEnd':0
        },function(err){
            callback(err,'');
        });
    }
    //将过期的还没审核通过的预约置为审核不通过
    /*
    function(callback){
        meetBookModel.update({state:1,endTime:{$lte:new Date().getTime()}},{state:3},function(err){
            callback(err,'');
        });
    }*/
    ], function(err, data) {
        db.close();
        if(!err){
            Response.end("handle over1");
        }else{
            Response.end("handle over2");
        } 
    });
}

exports.Runner = run;

