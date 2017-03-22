var MEAP = require("meap");
var mongoose = require("mongoose");
var meetSchema = require("../meetSchema.js");
var util = require("../../base/util.js");

/**
 * 多会议室预定判断是否已经有人提交预定
 * @author donghua.wang
 * @date 2015年06月12日 15:46
 * */
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var meetRoomIds = arg.meetRoomIds;
    var startTime = parseInt(arg.startTime);
    var endTime = parseInt(arg.endTime);
    var db = mongoose.createConnection(global.mongodbURL);
    var meetBookModel = db.model("meetBook", meetSchema.MeetBookSchema);
    meetBookModel.find({
        "state" : {"$in":[1,2,5]},
		"meetRoom2":{"$in":meetRoomIds},
        "startTime" : {
            "$lt" : endTime
        },
        "endTime" : {
            "$gt" : startTime
        }
    },{
		"name":1,
		"userId":1,
		"userName":1
	}, function(err, data) {
        db.close();
		var meetRooms = [];
		var userIds = [];
		var userNames = [];
        var status = "1";
        var msg = "已经有人提交了预定该会议室的申请";
        if(data.length == 0){
            status = "0";
            msg = "无人预定会议室";
        }else{
			for(var i in data){
				 var meetRoom = data[i].name;
				 var userId = data[i].userId;
				 var userName = data[i].userName;
				 if(util.inArray(meetRoom,meetRooms) == -1){
					 meetRooms.push(meetRoom);
				 }
				 if(util.inArray(userId,userIds) == -1){
					 userIds.push(userId);
					 userNames.push(userName);
				 }
			}
		}
        Response.setHeader("Content-Type","text/json;charset=utf-8");
        Response.end(JSON.stringify({
            "status":status,
            "msg":msg,
			"meetRooms":meetRooms,
			"userNames":userNames
        }));
    });
}

exports.Runner = run;

