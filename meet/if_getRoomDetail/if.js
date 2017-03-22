var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");
var async = require("async");
var util = require("../util.js");
/**
 * 3.9查询会议室详情（董元）
 * 2016-9-20改
 * zrx
 * 入参（会议室编号 ，开始时间，结束时间）
 */
function run(Param, Robot, Request, Response, IF)
{ 
     Response.setHeader("Content-type","text/json;charset=utf-8");
	var arg=JSON.parse(Param.body.toString());
	var db=mongoose.createConnection(global.mongodbURL);
	var MeetRoomModel=db.model("meetRoom",sm.MeetRoomSchema);
	var MeetBookModel=db.model("meetBook",sm.MeetBookSchema);
	var meetroomId = arg.meetroomId;
    var beginTime = parseInt(arg.beginTime, 10);
    var endTime = parseInt(arg.endTime, 10);
     //获取当天最早和最迟时间。
    var daybtime =util.getMaxtimeformdata(beginTime);
    var dayetime =util.getmintimeformdata(endTime);
	     var querymeet = [ {"$match" : {
                "meetRoom2":meetroomId,
                "state" : {
                    "$in" : [1,2,5,7]
                },
               "startTime" : {
            $lte : dayetime
        },
        "endTime" : {
            $gte : daybtime
        }
            }
        },{
            "$sort" : {
                 startTime : 1  
            }
        }
        ,{
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
	    function(cb){
	          MeetRoomModel.findOne({_id:meetroomId},function(err,res){
         if(!err){
             cb(null,res); 
         }else{
            console.log(err);
            cb(err,{"msg":"查询会议室失败"}); 
         }
            });  
	    }, 
	    function (cb){
            MeetBookModel.aggregate(querymeet, function(err, data) { 
             if(!err){ 
                 if(data==null){ cb(null, null); }else{ cb(null, data); }  
             }else{
               cb(err, {"msg":"查询报错"});  
             }
            });
        }
	],function(err,data){
	     db.close();
	    if(!err){ 
	        if(data[0].admin.length!=0){
	            var teldata =[];
	          async.map(data[0].admin, function(item, callback) { 
             util.getpersonmessage1(item.userId,item.userName,Robot, Request, Response, IF, callback)
          }, function(err,results) { //对比并得出值   
               teldata.push(results);  
               data[0].admin = teldata;
              Response.end(JSON.stringify({
              status:0,
              msg:"查询成功",
              data:{"MEETROOM":data[0],"TIMES":data[1]}  
                       })); 
                });  
	        } else{
	           Response.end(JSON.stringify({
              status:0,
              msg:"查询成功",
              data:{"MEETROOM":data[0],"TIMES":data[1]} 
                  }));  
	        }  
	    }else{
	        Response.end(JSON.stringify({
	          status:-1,
	          msg:"查询失败"
	      }));  
	    }  
	}); 
}
 

exports.Runner = run;
 