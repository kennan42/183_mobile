var MEAP = require("meap");
var mongoose = require("mongoose");
var meetSchema = require("../meetSchema.js");
var util = require("../../base/util.js");

/**
 * 判断会议室是否已经有人提交 预定
 * @author donghua.wang
 * @date 2015年06月12日 15:46
 * */
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var meetRoomId = arg.meetRoomId;
    var startTime = parseInt(arg.startTime);
    var endTime = parseInt(arg.endTime);
    var db = mongoose.createConnection(global.mongodbURL);
    var meetBookModel = db.model("meetBook", meetSchema.MeetBookSchema);
    meetBookModel.find({
        "meetRoom2":meetRoomId,
        "state" : {"$in":[1,2,5]},
        "startTime" : {
            "$lt" : endTime
        },
        "endTime" : {
            "$gt" : startTime
        }
    }, function(err, data) {
        db.close();
		var userIds = [];
		var userNames = [];
        var status = "1";
        var msg = "已经有人提交了预定该会议室的申请";
        if(data.length == 0){
            status = "0";
            msg = "无人预定该会议室";
        }else{//2015年06月17日 17:05 查询预定该会议室人员
			for(var i in data){
				var userId = data[i].userId;
				var userName = data[i].userName;
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
			"userNames":userNames
        }));
    });
}

exports.Runner = run;

