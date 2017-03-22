var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js"); 
var async = require("async");
var util = require("../util.js");

/**
 *查询会议室列表
 * zrx改（添加该会议室所有预定的时间）
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());  
    var db = mongoose.createConnection(global.mongodbURL);
    var MeetRoomModel = db.model("meetRoom", sm.MeetRoomSchema);
    var meetBookModel = db.model("meetBook", sm.MeetBookSchema);
    Response.setHeader("Content-type", "text/json;charset=utf-8");
    var beginTime = parseInt(arg.beginTime, 10);//筛选开始时间
    var endTime = parseInt(arg.endTime, 10);//筛选结束时间
    //获取当天最早和最迟时间。
    var daybtime =util.getMaxtimeformdata(beginTime);
    var dayetime =util.getmintimeformdata(endTime);
    var queryForMeetingRoom = {};
    if (arg.guishudiCode) {
        queryForMeetingRoom.guishudiId = arg.guishudiCode;
    }
    if (arg.needApply) {
        queryForMeetingRoom.needApply = parseInt(arg.needApply);
    }
    if (arg.type) {
        queryForMeetingRoom.type = parseInt(arg.type);
    }
    if (arg.level) {
        queryForMeetingRoom.level = parseInt(arg.level);
    }
    queryForMeetingRoom.state = {
        $in : [1, 2]
    }
    var pageNumber = arg.pageNumber;
    var pageSize = arg.pageSize;
    var skip = (pageNumber-1)*pageSize;
     var guishudiId = null; 
            //根据时间戳查询当天预约的情况
       
      var querymeet = [ {"$match" : { 
                "state" : {
                    "$in" : [1,2,5,7]
                },
                "startTime" : {
                    "$gte" : daybtime
                },
                "endTime" : {
                    "$lte" : dayetime
                }
            }
         } , {
         "$sort" : {
              startTime:1
            }
         } , {
            "$group" : {
                _id : "$meetRoom2", 
                HOURS : {
                    "$sum" : "$userTimes"
                },
                TIMES:{ $push:  { startTime: "$startTime", endTime: "$endTime" }  
             } 
            } 
        }, {
            "$sort" : {
                 HOURS : 1
            }
        }];
          if (arg.guishudiCode) {
             guishudiId = arg.guishudiCode;
             console.log("ssssssss");
             querymeet[0].$match.guishudiId=arg.guishudiCode;
           } 
    async.parallel([
        function(cb){ 
        MeetRoomModel.find(queryForMeetingRoom).skip(skip).limit(pageSize).sort({guishudiOrder:1,index:1}).exec(function(err, meetingRooms) {
        if (!err) { 
            cb(null,meetingRooms);
            /*Response.end(JSON.stringify({
                status : '0',
                msg : '查询成功',
                data : meetingRooms
            }));*/
        } else {
            cb(err,{"msg":"查询报错"});
            /*Response.end(JSON.stringify({
                status : '-1',
                msg : '没有符合查询条件的会议室'
            }));*/
        }
          });
        },
         function (cb){
            meetBookModel.aggregate(querymeet, function(err, data) { 
             if(!err){
               cb(null, data); 
             }else{
               cb(err, {"msg":"查询报错"});  
             }
            });
        } 
    ],function (err, data) {
             db.close(); 
             // 对比数据并组装数据 
             if(!err){
                if(data[0].length>0){
                 var datas = util.changeMeetRoomtodata(data[0],data[1]); 
                   Response.end(JSON.stringify({
                  status: 0,
                  msg: "查询成功", 
                  data:datas
                                }));  
             }else{
                 Response.end(JSON.stringify({
                  status: 0,
                  msg: "没有会议室", 
                  data:[]
                       }));
             }   
             }else{
                Response.end(JSON.stringify({
                  status: -1,
                  msg: "查询失败" 
                       })); 
             } 
                });  
}

exports.Runner = run;

