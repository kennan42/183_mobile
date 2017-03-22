var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");
var async = require("async");
var util = require("../util.js");
/**
 * 查询该会议室某段时间内的预订情况
 * 2016-9-20改
 * zrx
 */
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var meetingRoomId = arg.meetingRoomId;
    var startTime = parseInt(arg.startTime);
    var endTime = parseInt(arg.endTime);
    var db = mongoose.createConnection(global.mongodbURL);
    var meetBookModel = db.model("meetBook", sm.MeetBookSchema);
    var daybtime =util.getMaxtimeformdata(startTime);
    var dayetime =util.getmintimeformdata(endTime);
    meetBookModel.find({
        state : {
            $in : [1, 2, 5, 7]//1为审核中，2预定成功5，会议室结束 ，7 会议中 
        },
        meetRoom2 : arg.meetingRoomId,
        startTime : { 
           $gte :daybtime
        },
        endTime : { 
           $lte : dayetime
        }
    },{"userId":1,"userName":1,"state":1,"startTime":1,"endTime":1}).sort({
        "startTime" : 1
    }).exec(function(err, doc) {
        db.close();
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err) {
            //根据人员的编号查询人员信息 
             async.map(doc, function(item, callback) {  
             util.getPersonFromMas(item,Robot, Request, Response, IF, callback)
          }, function(err,results) { //对比并得出值  
             Response.end(JSON.stringify({
              status:0,
              msg:"查询成功",
              data: results 
                       })); 
                }); 
           /* Response.end(JSON.stringify({
                status : "0",
                msg : "查询成功",
                data : doc
            }));
            */
            addQueryMeetRoomLog();
        } else {
            Response.end(JSON.stringify({
                status : "-1",
                msg : "查询失败"
            }));
        }
    });
}

/**
 * 更新app端查询会议室详情次数
 * */
function addQueryMeetRoomLog() {
    var db = mongoose.createConnection(global.mongodbURL);
    var meetInvokeLogModel = db.model("meetInvokeLog", sm.MeetInvokeLogSchema);
    var meetInvokeLogObj = new meetInvokeLogModel({
        "invokeType" : "app",
        "func" : "queryMeetRoom",
        "createTime" : new Date().getTime()
    });
    meetInvokeLogObj.save(function(err) {
        db.close();
        if (!err) {
            console.log("addBookMeetRoomLog success");
        } else {
            console.log("addBookMeetRoomLog err--->", err);
        }
    });
}

exports.Runner = run;

