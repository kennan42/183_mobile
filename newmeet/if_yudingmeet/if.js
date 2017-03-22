var MEAP=require("meap");
var mongoose = require("mongoose");
var meetSchema = require("../meetSchema.js");

var moment = require('moment');

//预定419会议室
function run(Param, Robot, Request, Response, IF)
{
	var arg = JSON.parse(Param.body.toString());
	//获取当前时间
    var  currentDate =moment(new Date()).format("YYYYMMDD");
	
	var  startTime =moment(arg.startTime,'YYYYMMDD HH:mm:ss').toDate().getTime();
	
	console.log(startTime); 
	var  endTime =moment(arg.endTime,'YYYYMMDD HH:mm:ss').toDate().getTime();
	var mongodbURL = "mongodb://10.10.1.147:27017,10.10.1.148:27017,10.10.1.149:27017/mobile";
	var db = mongoose.createConnection(mongodbURL);
    var meetBookModel = db.model("meetBook", meetSchema.MeetBookSchema);
	
               var meetRoom ="56fc8dc1db63cbef72f81bde";
	           var  name ="徐庄信息技术中心专用419会议室";
			   var  guishudiId ="54dc0630691c730913f53c0b";
			   var  guishudiName ="徐庄园区";
			    var userId ='8101195';
				var userName='徐锐';
				var tel='13812335837';
				var topic ='徐锐主持的会议';
				var type ='内部普通会议';
				var level='';
				var state='2';
				var userNumber='10';
				
				
				var userTimes=0.5;
				var times =new Date().getTime();
				var goods=[];
	var meetBookEntity = new meetBookModel({
                "meetRoom" : meetRoom,
                "meetRoom2" : meetRoom,
                "name" : name,
                "guishudiId" : guishudiId,
                "guishudiName" :guishudiName,
                "needApply" : 1,
                "userId" : userId,
                "userName" : userName,
                "tel" : tel,
                "topic" : topic,
                "type" : type,
                "level" : level,
                "userNumber" : userNumber,
               
                "state" : state,
                "goods" :goods,
               
                
                "startTime" : startTime,
                "endTime" : endTime,
                "clearOverTime" : parseInt(endTime) + 5 * 60 * 1000,
                "userTimes" : userTimes,
                "createTime" : times,
                "checkTime" : null,
                "comments" : "",
                "ifKuaTian" : 0,
                "seatCard" : "",
                "multi" : 0,
                "applySrc":"app"
                
            });
            meetBookEntity.save(function(err, data) {
                if (!err) {
                   console.log("save ok");
				   Response.end(JSON.stringify({
                    status : "0",
                    msg : "预定成功"
					
                }));
                }
                
            });  
	
	
}

exports.Runner = run;


                                

	

