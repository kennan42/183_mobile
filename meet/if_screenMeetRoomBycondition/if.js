var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");
var async = require("async");
var util = require("../util.js");

/**
 * 筛选会议室（根据归属地，时间，会议室物品）
 * 得到符合要求的会议室（会议室信息及该会议室预定的信息）
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param, Robot, Request, Response, IF)
{ 
    Response.setHeader("Content-type", "text/json;charset=utf-8");
    var conn = mongoose.createConnection(global.mongodbURL);
    var meetBookModel = conn.model("meetBook", sm.MeetBookSchema);
    var MeetRoomModel = conn.model("meetRoom",sm.MeetRoomSchema); 
    var arg = JSON.parse(Param.body.toString());
    var guishudiId = arg.guishudiId; 
    var device = arg.device;
    var beginTime = parseInt(arg.beginTime, 10);//筛选开始时间
    var endTime = parseInt(arg.endTime, 10);//筛选结束时间
    //获取当天最早和最迟时间。
    var daybtime =util.getMaxtimeformdata(beginTime);
    var dayetime =util.getmintimeformdata(endTime);
  //会议室筛选（归属地，会议室物品）
    var query;
         if(device.length==0){
              query = [
                   {
                      "$match": { 
                        "guishudiId": guishudiId,  
                        "state": {
                          "$in": [1,2]
                          } 
                         }
                       }  
                      ];   
               }else{
                  query = [
                      {
                          "$match": { 
                              "guishudiId": guishudiId,  
                              "state": {
                              "$in": [1,2]
                                    },
                              "device.name" :{ 
                                 "$all": device 
                                         }
                                      }
                     }  
                      ];  
               }  
        //根据时间戳查询当天预约的情况
      var querymeet = [ {"$match" : {
                "guishudiId":guishudiId,
                "state" : {
                    "$in" : [1,2,5,7]
                },
             /*
                "startTime" : {
                                 "$gte" : daybtime
                             },
                             "endTime" : {
                                 "$lte" : dayetime
                             }*/
             
              "startTime" : {
                         $lte : dayetime
                                    },
                     "endTime" : {
                         $gte : daybtime
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
                TIMES:{ $push:  { startTime: "$startTime", endTime: "$endTime" }  
             } 
            } 
        }, {
            "$sort" : {
                 HOURS : 1
            }
        }];
 console.log("query:"+JSON.stringify(query[0].$match));
     async.parallel([  
          function(cb){//查询归属地下的所有 会议室 
              MeetRoomModel.find(query[0].$match).exec(function(err,res1){ 
                   if (err) {
                     cb(err, {"msg":"查询报错"});
                 } else { 
                     cb(null, res1);
                 }
             });
         } 
         ,  
         //查询
         function (cb){
            meetBookModel.aggregate(querymeet, function(err, data) { 
             if(!err){
               cb(null, data); 
             }else{
               cb(err, {"msg":"查询报错"});  
             }
            });
        },
        function(cb){//查询所有会议室
              MeetRoomModel.find({ 
                        "guishudiId": guishudiId,  
                        "state": {
                          "$in": [1,2]
                          } 
                         }).exec(function(err,res1){ 
                   if (err) {
                     cb(err, {"msg":"查询报错"});
                 } else { 
                     cb(null, res1);
                 }
             });
         }
    ], function (err, data) {
             conn.close(); 
             // 对比数据并组装数据 
           var datas = util.changeMeetRoomtodata(data[0],data[1]);
           var datas1 = util.changeMeetRoomtodata(data[2],data[1]);
          
           //根据筛选时间对datas中的数据进行筛选 (入参，时间段，数组)
           var newdata= util.getArrayFromDataBytimes(beginTime,endTime,datas);
           
           //对比数据
           var newdatas = [];
           for(var x  in datas1){
               var floag = false;
               for(var y  in newdata){
                   if(datas1[x].MEETROOM.name ==newdata[y].MEETROOM.name){
                       floag = true;
                       break;
                   }
               }
               if(!floag){
                  newdatas.push(datas1[x]); 
               }
           }
           for(var z in newdatas){
              newdata.push(newdatas[z]); 
           } 
           
                   Response.end(JSON.stringify({
                  status: 0,
                  msg: "查询成功", 
                  data:newdata

                        })); 
                });  
}

exports.Runner = run;