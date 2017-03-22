var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");

/**
 *多会议室预定判断是否已经有审核通过的会议室
 *@author  donghua.wang
 *@date 2015年06月15日 15:13
*/
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var meetingRoomIds = arg.meetingRoomIds;
    var startTime = arg.startTime;
    var endTime =arg.endTime;
    var db = mongoose.createConnection(global.mongodbURL);
    var meetBookModel = db.model('meetbook', sm.MeetBookSchema);
    meetBookModel.findOne({
        meetRoom2 : {"$in":meetingRoomIds},
        state : {"$in":[2,5]},
        startTime : {
            $lt : endTime
        },
        endTime : {
            $gt : startTime
        }
    },{
		"name":1
	}, function(err, data) {
        db.close();
		Response.setHeader("Content-type", "text/json;charset=utf-8");
		if(data != null){
			Response.end(JSON.stringify({
				"status":"1",
				"msg":"申请的会议室已经有被审核通过的",
				"data":data	
			}));
		}else{
			Response.end(JSON.stringify({
				"status":"0",
				"msg":"申请的会议室没有被审核通过的"
			}));
		}
    });
}

exports.Runner = run;

