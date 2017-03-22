var MEAP=require("meap");
var mongoose = require("mongoose");
var meetSchema = require("../meetSchema.js");
var async = require("async");
/**
 * 查询会议室信息，根据会议室ID生成二维码
 * 
 * */
function run(Param, Robot, Request, Response, IF)
{
     var db=mongoose.createConnection(global.mongodbURL);
     var meetRoomModel = db.model("meetRoom",meetSchema.MeetRoomSchema);
     meetRoomModel.find({"state":{"$in":[1,2]}},function(err,data){
         db.close();
         if(!err){
             createErweimaImage(0,data);
         }
     });
     
}

function createErweimaImage(i,data){
    i == i||0;
      
}

exports.Runner = run;


                                

	

