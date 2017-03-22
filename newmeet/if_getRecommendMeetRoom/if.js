var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");
var async = require("async");
var util = require("../util.js");
/**
 * 获取推荐的会议室
 * 
 * 入参:归属地,时间,
 * 出参：（会议室信息，该会议室被预定的时间段），排序方法：按会议室空余时间算。
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-type", "text/json;charset=utf-8");
    var conn = mongoose.createConnection(global.mongodbURL);
    var meetBookModel = conn.model("meetBook", sm.MeetBookSchema);
    var MeetRoomModel = conn.model("meetRoom",sm.MeetRoomSchema); 
    var arg = JSON.parse(Param.body.toString());
    var guishudiId = arg.guishudiId;// 
    //var beginTime = parseInt(arg.beginTime, 10);
    //var endTime = parseInt(arg.endTime, 10);
     var datetime = new Date().getTime();
     var beginTime = util.getMaxtimeformdata(datetime);
     var endTime = util.getmintimeformdata(datetime); 
     console.log("开始时间:"+beginTime);
     console.log("结束时间:"+endTime);
     var query = [
            {
                "$match": { 
                    "guishudiId": guishudiId,  
                    "state": {
                        "$in": [1,2]
                    }
                }
            }  
        ];  
     var querymeet = [ {"$match" : {
                "guishudiId":guishudiId,
                "state" : {
                    "$in" : [1,2,5,7]
                },
                "startTime" : {
                    "$gte" : beginTime
                },
                "endTime" : {
                    "$lte" : endTime
                }
            }
        } , 
         {
         "$sort" : {
              startTime:1
            }
         } , 
        {
            "$group" : {
                _id : "$meetRoom2", 
                HOURS : {
                    "$sum" : "$userTimes"
                },
                TIMES:{ $push:  { startTime: "$startTime", endTime: "$endTime" } }
            }
        }, {
            "$sort" : {
                 HOURS : 1  
            }
        }];

    async.parallel([  
         function(cb){//查询归属地下的所有 会议室 
              MeetRoomModel.find(query[0].$match
                  /*,{ "_id": 1,
        "guishudiId":1,
        "guishudiName": 1,
        "name": 1}
        */).exec(function(err,res1){ 
                   if (err) {
                     cb(err, {"msg":"查询报错"});
                 } else { 
                     cb(null, res1);
                 }
             });
         } , 
        function (cb){
            meetBookModel.aggregate(querymeet, function(err, data) { 
             if(!err){
               cb(null, data); 
             }else{
               cb(err, {"msg":"查询报错"});  
             }
            });
        }
    ], function (err, data) {
             conn.close(); 
             /**
              * 对比数据并组装数据
              */ 
           var datas = util.changeMeetRoomtodata(data[0],data[1]); 
                   Response.end(JSON.stringify({
                  status: 0,
                  msg: "查询成功", 
                  data:datas
                        })); 
                }); 
}
 
exports.Runner = run;
 