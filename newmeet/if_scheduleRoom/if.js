var MEAP = require("meap");
var mongoose = require("mongoose");
var mongoClient = require("mongodb").MongoClient;
var sm = require("../meetSchema.js");
var async = require("async");
var util = require("../../base/util.js");
var timeutil = require("../util.js");
var jpushUtil = require("../../jpush2/jpush_util.js");
/**
 *会议室预定
 * 2016-9-20改
 * zrx 
 */
function run(Param, Robot, Request, Response, IF) {
	Response.setHeader("Content-type", "text/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
    var startTime = parseInt(arg.startTime);
    var endTime = parseInt(arg.endTime);
    var db = mongoose.createConnection(global.mongodbURL);
    var MeetRoomModel = db.model("meetRoom", sm.MeetRoomSchema);
    var meetRoomObj = null; 
 
     MeetRoomModel.findById(arg.meetRoom, function(err, data) {//根据会议室编号查询会议室 
        if (!err && data != null) {
			console.log("第一步");
            meetRoomObj = data;
            if (data.state == 3 || data.state == 4) {
				console.log("第二步");
                db.close();
                Response.end(JSON.stringify({
                    status : '-1',
                    msg : '会议室已经停用或删除'
                }));
            } else if (data.state == 2) {//判断预约时间是否在冻结时间内
			console.log("第三步");
                if (data.frozenBegin <= endTime && data.frozenEnd >= startTime) {
                    db.close();
                    Response.end(JSON.stringify({
                        status : '-1',
                        msg : '该会议室在申请时间内已被冻结'
                    }));
                } else {
                    //会议室状态正常,判断该会议室在申请时间内是否已经被预约
                    var meetBookModel = db.model('meetbook', sm.MeetBookSchema);
                    meetBookModel.findOne({
                        'meetRoom2' : arg.meetRoom,
                        'state' : {
                            "$in" : [1, 2, 5,7]
                        },
                        'startTime' : {
                            '$lt' : endTime
                        },
                        'endTime' : {
                            '$gt' : startTime
                        }
                    }, function(err, data) {
                        if (data != null) {//已经被成功预约
                            Response.end(JSON.stringify({
                                status : '-1',
                                msg : '该会议室已经有人申请1'
                            }));
                        } else {
                            Response.end(JSON.stringify({
                                status : '0',
                                msg : '会议室预约申请已成功提交'
                            }));
                            bookMeetingRoom(false, db, arg, meetRoomObj);
                        }
                    });
                }
            } else {
				console.log("第四步");
                //会议室状态正常,判断该会议室在申请时间内是否已经被预约
                var meetBookModel = db.model('meetbook', sm.MeetBookSchema);
                meetBookModel.findOne({
                    'meetRoom2' : arg.meetRoom,
                    'state' : {
                        "$in" : [1, 2, 5,7]
                    },
                    'startTime' : {
                        '$lt' : endTime
                    },
                    'endTime' : {
                        '$gt' : startTime
                    }
                }, function(err, data) {
                    if (data != null) {//已经被成功预约
                        Response.end(JSON.stringify({
                            status : '-1',
                            msg : '该会议室已经有人申请2'
                        }));
                    } else {
                        Response.end(JSON.stringify({
                            status : '0',
                            msg : '会议室预约申请已成功提交'
                        }));
						console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
                        bookMeetingRoom(false, db, arg, meetRoomObj);
                    }
                });
            }
        } else {
            db.close();
            Response.end(JSON.stringify({
                status : -1,
                msg : "查询会议室信息失败"
            }));
        }
    }); 
	console.log("oooooo");
	
}
/*
 * 
 * 会议室预定
 */
function bookMeetingRoom(isBooked, db, arg, meetRoomObj) {
    var state = 1;
    var meetType = meetRoomObj.needApply;
    var userId = arg.userId;
    //判断用户是否为会议室管理员
    var MeetRoomModel = db.model("meetRoom", sm.MeetRoomSchema);
    MeetRoomModel.findOne({
        "_id" : arg.meetRoom,
        "admin.userId" : userId
    }, function(err, doc) {
        if (doc != null) {
            if (isBooked == false) {
                state = 2
            } else {
                state = 1;
            }
        } else {
            if (meetType == 0 && isBooked == false) {
                state = 2
            } else {
                state = 1;
            }
        }
console.log("aaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbbbbbbbb");
        var userName2 = "";
        async.series([
        //根据工号查询用户拼音
        function(cb) {
            mongoClient.connect(global.mongodbURL, function(err, db) {
                var baseUsers = db.collection("base_users");
                var regExp = new RegExp(userId);
                baseUsers.findOne({
                    "PERNR" : regExp
                }, function(err, doc) {
                    db.close();
                    if (doc != null) {
                        userName2 = doc.VORNA;
                    }
                    cb(null, "");
                });
            });
        },
        //保存会议室预定信息
        function(cb) {
            var MeetBookModel = db.model("meetBook", sm.MeetBookSchema);
            var times = new Date().getTime();
            arg.times = times;
            var MeetBookEntity = new MeetBookModel({
                meetRoom : arg.meetRoom,
                meetRoom2 : arg.meetRoom,
                name : arg.name,
                shortName : arg.shortName,
                guishudiId : arg.guishudiCode,
                guishudiName : arg.guishudiName,
                needApply : arg.needApply,
                userId : arg.userId,
                userName : arg.userName,
                tel : arg.tel,
                topic : arg.topic,
                type : arg.type,
                level : arg.level,
                userNumber : arg.userNumber,
                checkUser : arg.checkUser,
                state : state,
                goods : arg.goods,
                devices: arg.devices,
                servicePersonal : arg.servicePersonal,
                technicist : arg.technicist,
                participants:arg.participants,
                remark : arg.remark,
                startTime : arg.startTime,
                endTime : arg.endTime,
                clearOverTime : arg.clearOverTime,
                userTimes : arg.userTimes,
                createTime : times,
                checkTime : null,
                comments : "",
                ifKuaTian : arg.ifKuaTian,
                seatCard : arg.seatCard,
                multi : 0,
                applySrc : "app",
				userName2:userName2,
				ifinform:arg.ifinform,//是否发送消息给与会人（2016-9-21）0不发送，1发送
                ifremind:arg.ifremind,//是否会议15分钟提醒（2016-9-21）0不提醒 1提醒 
                ifremindtoAdmin:0,//是否给管理员发送提醒
                canclereason:"",//取消的原因
                applySrc:"app"
            });
            MeetBookEntity.save(function(err) {
                db.close();
                addBookMeetRoomLog(arg, meetRoomObj);
                if (state == 1) {//需要审批
                    pushMsg(arg);
                 //会议室预定成功，当会议室需要管理员审批的时候，在管理员审批后启动定时提醒任务。当会议室不需要审批时
                 //这时候创建提醒任务。（这边最好只传预订人，会议室编号及预订时间，在会议室15分钟之前去查看）
                }else{//是否通知与会人
                    if(arg.ifinform==1||arg.ifremind==1){//推送消息给与会人
                        var param =  {
                         "ifjpush":arg.ifinform,
                         "ifsend":arg.ifremind,
                         "userid":arg.userId,
                         "name":arg.name,
                         "topic":arg.topic,
                         "userList":arg.participants,
                         "sTime":timeutil.getMMddHHmmFromTimes(arg.startTime),
                         "eTime":timeutil.getMMddHHmmFromTimes(arg.endTime)   
                        }
                         timeutil.sendmessage(param,Robot, Request, Response, IF, cb); 
                      } 
                }
                cb(null, "");
            });
        }], function(err, data) {
			console.log("book meetroom handle over");
        }); 
    });

}

//向会议室管理员推送消息
function pushMsg(arg) {
    console.log("scheduleRoom--->", arg);
    var checkUser = arg.checkUser;
    var userIds = [];
    var title = "您有一条" + util.getMMddHHmmFromTimes(arg.startTime) + "开始" + arg.name + "进行的会议需要审批，要尽快处理喔~";
    for (var i in checkUser) {
        userIds.push(checkUser[i].userId);
        var rtxArg = {
            "userId" : checkUser[i].userId,
            "title" : title,
            "times" : arg.times,
            "applyUser" : arg.userId
        };
        sendRTXMsg(rtxArg);
    }
    var pushArg = {
        appId : global.appId,
        platforms : "0,1",
        title : title,
        body : new Date().getTime() + "_MeetingRoomApply",
        userIds : userIds,
        badgeNum : 3,
        module : "MeetingRoomBooking",
        subModule : "MeetingRoomApply",
        type : "remind"
    };
    var jpushArg = {
        userid : arg.userId,
        userList : userIds,
        title : "",
        content : pushArg.title,
        type : 0,
        msgType : "MeetingRoomBooking",
        subModule : "MeetingRoomApply"
    };
    if (global.pushType == "emm") {
        util.pushMsg(pushArg);
    } else {
        jpushUtil.jpush(jpushArg);
    }
}

 
/**
 *添加预定日志
 *  */
function addBookMeetRoomLog(arg, meetRoomObj) {
    var db = mongoose.createConnection(global.mongodbURL);
    var meetInvokeLogModel = db.model("meetInvokeLog", sm.MeetInvokeLogSchema);
    var meetInvokeLogObj = new meetInvokeLogModel({
        "invokeType" : "app",
        "func" : "bookMeetRoom",
        "guishudiName" : arg.guishudiName,
        "needApply" : meetRoomObj.needApply,
        "meetRoomType" : meetRoomObj.type,
        "createTime" : new Date().getTime()
    });
    meetInvokeLogObj.save(function(err) {
        db.close();
        if (!err) {
            console.log("addBookMeetRoomLog success");
        } else {
            console.log("addBookMeetRoomLog err--->", err);
        }
    });
}



function sendRTXMsg(rtxArg) {
    setTimeout(function() {
        var db = mongoose.createConnection(global.mongodbURL);
        var meetBookModel = db.model('meetbook', sm.MeetBookSchema);
        var condition = {
            "createTime" : rtxArg.times,
            "userId" : rtxArg.applyUser,
            "state" : 1
        };
        meetBookModel.findOne(condition, function(err, data) {
            db.close();
            //该申请还处于未审核状态
            if (data != null) {
                util.sendRTXMsg(rtxArg);
            }
        });
    }, 1000 * 60);
}

exports.Runner = run;

