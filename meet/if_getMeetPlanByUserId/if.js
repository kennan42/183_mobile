var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");
var bSchema =require("../Contact.js");
var async = require("async");
var util = require("../util.js");


/**
 * 根据人员ID查询当天会议安排情况
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
                    meetBookModel.find(query).sort({"createTime":1}).exec(function(err,data){  
                         if(!err){
                              cb("",data);
                           }else{
                              cb(err,0);
                               } 
                              });  
                       } 
            /* function(cb){
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
             */
         ],function(err,data){
             db.close();
               Response.setHeader("Content-type","text/json;charset=utf-8");
             if(!err){
              async.map(data[0], function(item, callback) { 
             util.getPersonFromMas(item,Robot, Request, Response, IF, callback)
          }, function(err,results) { //对比并得出值   
             Response.end(JSON.stringify({
              status:0,
              msg:"查询成功",
              data: results 
                       })); 
                }); 
             }else{
               Response.end(JSON.stringify({
             status:-1,
             msg:"查询失败" 
                 }));    
             }
         });  
}

exports.Runner = run;


                                

	

