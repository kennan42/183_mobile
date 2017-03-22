var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");
var bSchema =require("../Contact.js");
var async = require("async");
var util = require("../util.js");

/**
 * 是否有会议
 * 2016-9-23
 * zrx
 * 入参:人员工号,开始时间,结束时间
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param, Robot, Request, Response, IF)
{
	 var arg = JSON.parse(Param.body.toString());
	 var userId = arg.userId;
     var startTime = parseInt(arg.startTime);
     var endTime = parseInt(arg.endTime);
     var db = mongoose.createConnection(global.mongodbURL);
     var meetBookModel = db.model("meetBook", sm.MeetBookSchema);
     var baseUserModel = db.model("base_user", bSchema.BaseUserSchema);
     var daybtime =util.getMaxtimeformdata(startTime);//当日最早时间戳和最迟时间戳
     var dayetime =util.getmintimeformdata(endTime);
     var query ={
           $or:[{"userId":userId},
                {"participants":userId}//这边要改成与会人员
               ],
                "startTime" : { 
                     $gte :daybtime
                },
                "endTime" : { 
                     $lte : dayetime
                }
              };
         async.parallel([
             function(cb){
                    meetBookModel.count(query).exec(function(err,data){  
                         if(!err){
                              cb("",data);
                           }else{
                              cb(err,0);
                               } 
                              });  
                       },
             function(cb){
                  if (userId.length == 7) {
                            userId = "0" + userId;
                           } 
                     baseUserModel.find({ "PERNR" : userId},
                     {"PERNR":1,"NACHN":1,"ZZ_JG1T":1,"STLTX":1,
                      "photoURL2" : 1,"photoURL" : 1},
                      function(err, data) {
                                if(!err){
                                    cb("",data);
                                } else{
                                    cb(err,null);
                                } 
                               });
             }
         ],function(err,data){
             db.close();
             Response.setHeader("Content-type","text/json;charset=utf-8");
             if(!err){
              Response.end(JSON.stringify({
              status:0,
              msg:"查询成功",
              data:{"PERSON":data[1],"IFHASMEET":data[0]}
         }));    
             }else{
               Response.end(JSON.stringify({
             status:-1,
             msg:"查询失败" 
         }));    
             }
         });   
 
} 

exports.Runner = run;

 

