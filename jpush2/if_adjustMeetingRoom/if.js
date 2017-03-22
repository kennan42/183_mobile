var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");
var async = require("async");
var util = require("../../base/util.js");
var jpushUtil = require("../../jpush2/jpush_util.js");

/**
 * 会议室调整
 * */
var meetBookObj = null;
function run(Param, Robot, Request, Response, IF) {
    try {
        var arg = JSON.parse(Param.body.toString());
        var scheduleId = arg.scheduleId;
        var meetingRoomId = arg.meetingRoomId;
        var meetRoomName = arg.meetRoomName;
        var startTime = parseInt(arg.startTime);
        var endTime = parseInt(arg.endTime);
        var servicePersonal = arg.servicePersonal;
        var technicist = arg.technicist;
        var comments = arg.comments;
        var goods = arg.goods;

        var db = mongoose.createConnection(global.mongodbURL);
        var MeetBookModel = db.model("meetBook", sm.MeetBookSchema);
        var MeetRoomModel = db.model("meetRoom", sm.MeetRoomSchema);
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        async.series([
        //判断调整后的会议室是否已经被预约,状态是否正常
        function(callback) {
            MeetRoomModel.findById(meetingRoomId, function(err, meetRoomObj) {
                if (err) {
                    db.close();
                    Response.end(JSON.stringify({
                        status : "-1",
                        msg : "查询会议室信息失败"
                    }));
                    return;
                }
                if (meetRoomObj.state == 3 || meetRoomObj.state == 4) {
                    db.close();
                    Response.end(JSON.stringify({
                        status : "-1",
                        msg : "该会议室已经停用或者删除"
                    }));
                    return;
                }
                if (meetRoomObj.state == 2 && meetRoomObj.frozenBegin < endTime && meetRoomObj.frozenEnd > startTime) {
                    db.close();
                    Response.end(JSON.stringify({
                        status : "-1",
                        msg : "该会议室在该预约时间内有冻结时间"
                    }));
                    return;
                }
                callback(err, '');
            });
        },
        //判断该会议室是否已经被预约
        function(callback) {
            MeetBookModel.findOne({
                'meetRoom' : meetingRoomId,
                'state' : 2,
                'startTime' : {
                    '$lte' : endTime
                },
                'endTime' : {
                    '$gte' : startTime
                }
            }, function(err, doc) {
                if (doc != null) {
                    db.close();
                    Response.end(JSON.stringify({
                        status : '-1',
                        msg : '该会议室已经被预定'
                    }));
                    return;
                }
                callback(err, '');
            });
        },
        //查询调整前的会议室预定信息
        function(callback) {
            MeetBookModel.findById(scheduleId, function(err, data) {
                meetBookObj = data;
                callback(err, "");
            });
        },
        //调整会议室预约
        function(callback) {
            MeetBookModel.update({
                '_id' : scheduleId
            }, {
                'meetRoom' : meetingRoomId,
                'meetRoom2' : meetingRoomId,
                'name' : meetRoomName,
                'startTime' : startTime,
                'endTime' : endTime,
                'clearOverTime' : parseInt(arg.clearOverTime),
                'servicePersonal' : servicePersonal,
                'technicist' : technicist,
                'comments' : comments,
                'state' : 2,
                "goods" : goods,
                "userTimes" : arg.userTimes,
                "guishudiId" : arg.guishudiCode,
                "guishudiName" : arg.guishudiName,
                "needApply" : arg.needApply,
                "ifKuaTian" : arg.ifKuaTian,
                "examineUser" : [{
                    userId : arg.userId,
                    userName : arg.userName
                }],
                "checkTime" : new Date().getTime(),
                "clearOverTime" : arg.clearOverTime
            }, function(err,data) {
                db.close();
                if (!err) {
                    Response.end(JSON.stringify({
                        status : '0',
                        msg : '调整成功'
                    }));
                    pushMsg(arg,data);
					pushMsg2ServicePerson(arg,data);
                } else {
                    Response.end(JSON.stringify({
                        status : '-1',
                        msg : '调整失败'
                    }));
                }
                return;
            });
        }], function(err, data) {

        });
    } catch(e) {

    }
}

function pushMsg(arg,meetBook) {
	var userIds = [];
	userIds.push(meetBookObj.userId);
    var pushArg = {
        appId : global.appId,
        platforms : "0,1",
        title : "您预订的" + util.getMMddHHmmFromTimes(meetBookObj.startTime) + "开始" + meetBookObj.name + "进行的会议申请已被管理员调整了，请及时查看以免影响会议进行，如有问题请及时联系管理员哦。",
        body : new Date().getTime() + "_ChangeMeetingRoom",
        userIds : userIds,
        badgeNum : 3,
        module : "MeetingRoomBooking",
        subModule : "ChangeMeetingRoom",
        type : "remind"
    }
    //util.pushMsg(pushArg);
	var jpushArg = {
		userid:arg.userId,
		userList:userIds,
		title:"",
		content:pushArg.title,
		type:0
	};
	jpushUtil.jpush(jpushArg);
}
function pushMsg2ServicePerson(arg,meetBook){
	if(arg.servicePersonal != null && arg.servicePersonal.length > 0){
			var users = arg.servicePersonal;
			var userIds = [];
			for(var i in users ){
				 	userIds.push(users[i].userId);
			}
			var pushArg = {
                    appId : global.appId,
                    platforms : "0,1",
                    title : "有一场" + util.getMMddHHmmFromTimes(arg.startTime) 
                            + "开始" + arg.meetRoomName +  "进行的会议需要亲服务支持哦，请及时查看。",
                    body : new Date().getTime() + "_ChangeMeetingRoomManager",
                    userIds : userIds,
                    badgeNum : 3,
                    module : "MeetingRoomBooking",
                    subModule : "ChangeMeetingRoomManager",
                    type : "remind"
				};
			 //util.pushMsg(pushArg);
			 var jpushArg = {
				 userid:meetBook.userId,
				 userList:userIds,
				 title:"",
				 content:pushArg.title,
				 type:0
			 };
			 jpushUtil.jpush(jpushArg);
	}
}

exports.Runner = run;

