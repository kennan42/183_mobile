var MEAP = require("meap");
var mongoose = require("mongoose");
var meetSchema = require("../meetSchema.js");
var async = require("async");
var util = require("../../base/util.js");
var jpushUtil = require("../../jpush2/jpush_util.js");

var startTime = null;
var endTime = null;
var currentTimes = null;
var guishudiNames = null;
var meetRoomObjs = null;
var applyUserId = null;
function run(Param, Robot, Request, Response, IF) {
    meetRoomObjs = [];
    guishudiNames = [];
    var arg = JSON.parse(Param.body.toString());
	applyUserId = arg.userId;
    currentTimes = new Date().getTime();
    var meetRoomIds = arg.meetRoomIds;
    startTime = parseInt(arg.startTime);
    endTime = parseInt(arg.endTime);
    bookMeetingRoom(0, meetRoomIds, arg, Response);
}

function bookMeetingRoom(i, meetRoomIds, arg, Response) {
    i = i || 0;
    var db;
    if (db == null) {
        db = mongoose.createConnection(global.mongodbURL);
    }
    var meetRoomModel;
    if (meetRoomModel == null) {
        meetRoomModel = db.model("meetRoom", meetSchema.MeetRoomSchema);
    }
    var meetBookModel;
    if (meetBookModel == null) {
        meetBookModel = db.model("meetBook", meetSchema.MeetBookSchema);
    }
    if (i < meetRoomIds.length) {
        var meetRoomId = meetRoomIds[i];
        var userId = arg.userId;
        var isAdmin = false;
        var isBooked = false;
        var admin = null;
        var meetRoomObj = null;
        async.series([

        function(callback) {
            meetRoomModel.findOne({
                "_id" : meetRoomId,
                "admin.userId" : userId
            }, function(err, data) {
                if (data != null) {
                    isAdmin = true;
                }
                callback(err, "");
            });
        },

        function(callback) {
            meetBookModel.findOne({
                "meetRoom2" : meetRoomId,
                "state" : {$in:[2,5]},
                "startTime" : {
                    "$lte" : endTime
                },
                "endTime" : {
                    "$gte" : startTime
                }
            }, function(err, data) {
                if (data != null) {
                    isBooked = true;
                }
                callback(err, "");
            });
        },

        function(callback) {
            meetRoomModel.findById(meetRoomId, function(err, data) {
                admin = data.admin;
                meetRoomObjs.push(data);
                meetRoomObj = data;
                callback(err, "");
            });
        },
        function(callback) {
            var state = 1;
            if (isAdmin && !isBooked) {
                state = 2;
            }
			var times = new Date().getTime();
            var meetBookEntity = new meetBookModel({
                "meetRoom" : meetRoomId,
                "meetRoom2" : meetRoomId,
                "name" : meetRoomObj.name,
                "guishudiId" : meetRoomObj.guishudiId,
                "guishudiName" : meetRoomObj.guishudiName,
                "needApply" : 1,
                "userId" : userId,
                "userName" : arg.userName,
                "tel" : arg.tel,
                "topic" : arg.topic,
                "type" : arg.type,
                "level" : arg.level,
                "userNumber" : arg.userNumber,
                "checkUser" : admin,
                "state" : state,
                "goods" : arg.goods,
                "servicePersonal" : arg.servicePersonal,
                "technicist" : arg.technicist,
                "remark" : arg.remark,
                "startTime" : startTime,
                "endTime" : endTime,
                "clearOverTime" : parseInt(arg.endTime) + parseInt(meetRoomObj.clearMinute) * 60 * 1000,
                "userTimes" : arg.userTimes,
                "createTime" : times,
                "checkTime" : null,
                "comments" : "",
                "ifKuaTian" : arg.ifKuaTian,
                "seatCard" : arg.seatCard,
                "multi" : 1
            });
            meetBookEntity.save(function(err, data) {
                if (!err) {
                    guishudiNames.push(meetRoomObj.guishudiName);
                    pushMsg(arg, admin,meetRoomObj,times);
                }
                callback(err, "");
            });
        }], function(err, data) {
            i++;
            bookMeetingRoom(i, meetRoomIds, arg, Response);
        });
    } else {
        db.close();
        Response.setHeader("Content-Type", "text/json;charset=utf-8");
        Response.end(JSON.stringify({
            status : "0",
            msg : "会议室预约申请已成功提交"
        }));
        addBookMeetRoomLog(0,meetRoomObjs);
    }
}

/**
 *向会议室管理员推送消息
 *@param arg 会议室预定信息
 *@param admin 会议室管理员
 */
function pushMsg(arg, admin,meetRoomObj,times) {
	var userIds = [];
	var title =  "您有一条" + util.getMMddHHmmFromTimes(arg.startTime) + "开始" + meetRoomObj.name + "进行的会议需要审批，要尽快处理喔~";
    for (var i in admin) {
        userIds.push(admin[i].userId);
		var rtxArg = {"userId":admin[i].userId,"title":title,"times":times,"applyUser":applyUserId};
        sendRTXMsg(rtxArg);
    }
	 var pushArg = {
            appId : global.appId,
            platforms : "0,1",
            title : title,
            body : new Date().getTime() + "_MeetingRoomApply",
            userIds :userIds,
            badgeNum : 3,
            module : "MeetingRoomBooking",
            subModule : "MeetingRoomApply",
            type : "remind"
        };
	//util.pushMsg(pushArg);
	var jpushArg = {
		userid:arg.userId,
		userList:userIds,
		title:"",
		content:title,
		type:0
	};
	jpushUtil.jpush(jpushArg);
}

/**
 *添加预定日志
 *  */
function addBookMeetRoomLog(i,meetRoomObjs) {
    i = i||0;
    var db;
    if(db == null){
        db = mongoose.createConnection(global.mongodbURL);
    }
    var meetInvokeLogModel;
    if(meetInvokeLogModel == null){
        meetInvokeLogModel = db.model("meetInvokeLog", meetSchema.MeetInvokeLogSchema);
    }
    if(i < meetRoomObjs.length){
    var meetInvokeLogObj = new meetInvokeLogModel({
        "invokeType":"app",
        "func":"bookMeetRoom",
        "guishudiName":meetRoomObjs[i].guishudiName,
        "needApply":meetRoomObjs[i].needApply,
        "meetRoomType":meetRoomObjs[i].type,
        "createTime":new Date().getTime()
    });
    meetInvokeLogObj.save(function(err){
        if(!err){
            console.log("addBookMeetRoomLog success");
        }else{
             console.log("addBookMeetRoomLog err--->",err);
        }
        i++;
        addBookMeetRoomLog(i,meetRoomObjs);
    });
    }else{
        db.close();
        console.log("bookMultiMeetRoom addLog over");
    }
}

function sendRTXMsg(rtxArg){
	setTimeout(function(){
		var db = mongoose.createConnection(global.mongodbURL);
		var meetBookModel = db.model('meetbook', meetSchema.MeetBookSchema);
		var condition = {"createTime":rtxArg.times,"userId":rtxArg.applyUser,"state":1};
		meetBookModel.findOne(condition,function(err,data){
			db.close();
			//该申请还处于未审核状态
			if(data != null){
				util.sendRTXMsg(rtxArg);
			}
		});
	},1000*60);
}

exports.Runner = run;

