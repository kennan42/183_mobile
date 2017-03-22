var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");
var util = require("../util.js"); 
var async = require("async");
/**
 * 我的预定,带有分页
 * zrx
 * 一周内,一月内 ,一月前
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
    var meetRoomModel = conn.model('meetRoom', sm.MeetRoomSchema);
    var arg = JSON.parse(Param.body.toString());
    var type = arg.type;//1为一周内，2为一月内，3为一月前
    var pageNum = arg.pageNum;
    var pageSize = arg.pageSize;
    var skip = (pageNum-1)*pageSize;
     //获取当天时间
    var query ={};
    var timestamp =  Date.parse(util.getDateStartTime(new Date()))/1000; 
    if(type==1){//当前时间之后未开始的会议预定 
       var serventime = Date.parse(new Date()); 
        query = {
                    "userId": arg.userId,
                   
                   "state":{
                       "$in":[1,2]
                   }
            };
            console.log("aaaa:"+JSON.stringify(query));
    } else if(type==2){
        var serventime =(timestamp - 30*86400)*1000; 
        query ={
                    "userId": arg.userId,
                    "startTime" : { 
                     "$gte" : serventime
                   },
                   "state":{
                       "$in":[3,4,5,6,7]
                   }
            };
    }else if(type==3){
         var serventime =(timestamp - 30*86400)*1000; 
        query ={
                    "userId": arg.userId,
                    "startTime" : { 
                     "$lte" : serventime
                   } 
                };
    }  
        async.parallel([
        function(cb){ 
            meetBookModel.count(query, function (err, count) {
                if (err) {
                    cb(err, {});
                } else {
                    cb(null, count);
                } 
            });
        },function(cb){
            meetBookModel.find(query).skip(skip).limit(pageSize).sort({"startTime":-1}).populate("meetRoom",{"image":1,"homesector":1,"meetlevel":1}).exec(function(err,data){
        if(!err){ 
             cb(err, data);
        }else{ 
             cb(err, {});
        }
            });   
        }
    ],function(err,data){
       conn.close();
       if(!err){
           Response.end(JSON.stringify({
               status:0,
               msg:"查询成功",
               count:data[0],
               data:data[1]
           }));
       }else{
          Response.end(JSON.stringify({
               status:-1,
               msg:"查询失败"
           })); 
       }
    } ); 

} 
exports.Runner = run;
 