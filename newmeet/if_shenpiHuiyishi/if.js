var MEAP = require("meap");
var mongoose = require("mongoose");
var sm = require("../meetSchema.js");
var async = require("async");
var util = require("../../base/util.js");
var jpushUtil = require("../../jpush2/jpush_util.js");

/**
 * 审核会议室
 * */
var meetBookObj = null;
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var db = mongoose.createConnection(global.mongodbURL);
    var meetBookModel = db.model("meetBook", sm.MeetBookSchema);
    var startTime = null;
    var endTime = null;
    var state = parseInt(arg.state);
    Response.setHeader("Content-type", "text/json;charset=utf-8");
    async.series([
    //查询当前会议室预定信息
    function(callback) {
        meetBookModel.findById(arg.scheduleId, function(err, data) {
            if (!err && data != null) {
                startTime = data.startTime;
                endTime = data.endTime;
                 meetBookObj = data;
                callback(err, data);
            } else {
                db.close();
                Response.end(JSON.stringify({
                    status : "-1",
                    msg : "查询会议室预定信息失败"
                }));
                return;
            }
        });
    },
    //判断预约的会议室状态是否正常
    function(callback) {
        if (state == 2) {
            var meetingRoomModel = db.model("meetRoom", sm.MeetRoomSchema);
            meetingRoomModel.findById(arg.meetRoomId, function(err, doc) {
                if (doc.state == 3 || doc.state == 4) {
                    db.close();
                    Response.end(JSON.stringify({
                        status : "-1",
                        msg : "该会议室已经停用"
                    }));
                    return;
                }
                if (doc.state == 2 && doc.frozenBegin < endTime && doc.frozenEnd > startTime) {
                    db.close();
                    Response.end(JSON.stringify({
                        status : "-1",
                        msg : "该会议室在申请时间内被冻结"
                    }));
                    return;
                }
                if(state == 6 && doc.startTime > new Date().getTime()){
                    Response.end(JSON.stringify({
                        status : "-1",
                        msg : "该会议已经开始"
                    }));
                    db.close();
                    return;
                }
                callback(null, "");
            });
        } else {
            callback(null, "");
        }
    },
    //如果预定成功，判断是否和别的冲突
    function(callback) {
        if (state == 2) {
            var meetRoomId = arg.meetRoomId;
            meetBookModel.findOne({
                meetRoom2 : meetRoomId,
               state : {"$in":[2,5]},
                startTime : {
                    $lt : endTime
                },
                endTime : {
                    $gt : startTime
                }
            }, function(err, data) {
                if (!err && data != null) {
                    db.close();
                    Response.end(JSON.stringify({
                        status : "-1",
                        msg : "该时间端会议室已经被预约"
                    }));
                    return;
                } else {
                    callback(null, '');
                }
            });
        } else {
            callback(null, '');
        }
    },
    //更改会议室预定状态
    function(callback) {
        var update = {
            state : state,
            checkTime : new Date().getTime(),
            examineUser : [{
                userId : arg.userId,
                userName : arg.userName
            }],
            comments:arg.comments
        };
        if(state == 2){
            update.servicePersonal = (arg.servicePersonal==null?[]:arg.servicePersonal);
            update.technicist = (arg.technicist==null?[]:arg.technicist);
        }
        meetBookModel.update({
            _id : arg.scheduleId
        }, update, function(err, data) {
            db.close();
            if (!err) {
                Response.end(JSON.stringify({
                    status : "0",
                    msg : "审核成功"
                }));
                pushMsg2ApplyPerson(arg,data);
                pushMsg2ServicePerson(arg,data);
            } else {
                Response.end(JSON.stringify({
                    status : "-1",
                    msg : "审核失败"
                }));
            }
        });
    }], function(err, data) {

    });
}


//将审核结果推送给申请人
function pushMsg2ApplyPerson(arg,meetBook) {
    var db = mongoose.createConnection(global.mongodbURL);
    var meetBookModel = db.model("meetBook", sm.MeetBookSchema);
    meetBookModel.findById(arg.scheduleId, function(err, data) {
        db.close();
        var userId = data.userId;
        var userName = data.userName;
        var str = "";
        var subModule = "";
        var startDate = util.getMMddHHmmFromTimes(meetBookObj.startTime);
        var meetRoomName = meetBookObj.name;
        if (arg.state == '2') {
            str = "您" + startDate + "开始" + meetRoomName + "进行的会议已审核通过啦。";
            subModule = "MeetingRoomApplyComplete";
        } else if (arg.state == '3') {
            str = "您" + startDate + "开始" + meetRoomName + "进行的会议已被驳回，可以继续预定其他会议室或会议时间哦。";
            subModule = "OffMeetingRoom";
        } else {
            str = "您" + startDate + "开始" + meetRoomName + "进行的会议已被管理员取消啦";
            subModule = "CancelMeetingRoom";
        }
        var userIds = [];
        userIds.push(data.userId);
        var pushArg = {
            appId : global.appId,
            platforms : "0,1",
            title : str,
            body :  new Date().getTime() + "_" + subModule,
            userIds :userIds ,
            badgeNum : 3,
            module : "MeetingRoomBooking",
            subModule : subModule,
            type : "remind"
        };
        var jpushArg = {
            userid:arg.userId,
            userList:userIds,
            title:"",
            content:pushArg.title,
            type:0,
            msgType : "MeetingRoomBooking",
            subModule : subModule
        };
        if(global.pushType == "emm"){
            util.pushMsg(pushArg);
        }else{
            jpushUtil.jpush(jpushArg);
        }
    });
}
/**
 *给服务人员推送消息 
 */
function pushMsg2ServicePerson(arg,meetBook) {
    if (arg.servicePersonal != null && arg.servicePersonal.length > 0&&arg.state == '2') {//会议室通过后通知服务人员
        var persons = arg.servicePersonal;
        var userIds = [];
        for (var i in persons) {
            var userId = persons[i].userId;
            userIds.push(userId);
        }
        var pushArg = {
                    appId : global.appId,
                    platforms : "0,1",
                    title : "有一场" + util.getMMddHHmmFromTimes(meetBookObj.startTime) 
                            + "开始" + meetBookObj.name +  "进行的会议需要亲服务支持哦，请及时查看。",
                    body :  new Date().getTime() + "_ChangeMeetingRoomManager",
                    userIds : userIds,
                    badgeNum : 3,
                    module : "MeetingRoomBooking",
                    subModule : "ChangeMeetingRoomManager",
                    type : "remind"
            };
        var jpushArg = {
            userid:arg.userId,
            userList:userIds,
            title:"",
            content:pushArg.title,
            type:0,
            msgType : "MeetingRoomBooking",
            subModule : "ChangeMeetingRoomManager"
        };
        if(global.pushType == "emm"){
            util.pushMsg(pushArg);
        }else{
            jpushUtil.jpush(jpushArg);
        }
         pushMsg2technicist(arg,meetBook); //给技术人员推送消息
    }
}
/**
 *给技术人员推送
 * @param {Object} arg
 * @param {Object} meetBook
 */
function pushMsg2technicist(arg,meetBook) {
    if (arg.technicist != null && arg.technicist.length > 0&&arg.state == '2') {//会议室通过后通知技术人员
        var technicist = arg.technicist;
        var userIds = [];
        for (var i in technicist) {
            var userId = technicist[i].userId;
            userIds.push(userId);
        }
        var pushArg = {
                    appId : global.appId,
                    platforms : "0,1",
                    title : "有一场" + util.getMMddHHmmFromTimes(meetBookObj.startTime) 
                            + "开始" + meetBookObj.name +  "进行的会议需要亲服务支持哦，请及时查看。",
                    body :  new Date().getTime() + "_ChangeMeetingRoomManager",
                    userIds : userIds,
                    badgeNum : 3,
                    module : "MeetingRoomBooking",
                    subModule : "ChangeMeetingRoomManager",
                    type : "remind"
            };
        var jpushArg = {
            userid:arg.userId,
            userList:userIds,
            title:"",
            content:pushArg.title,
            type:0,
            msgType : "MeetingRoomBooking",
            subModule : "ChangeMeetingRoomManager"
        };
        if(global.pushType == "emm"){
            util.pushMsg(pushArg);
        }else{
            jpushUtil.jpush(jpushArg);
        }
    }
}
/**
 *给与会人员推送消息 
 * @param {Object} arg
 * @param {Object} meetBook
 */
function pushMsg2participants(arg,meetBook) { 
    if(arg.state == '2'){
    var db = mongoose.createConnection(global.mongodbURL);
    var meetBookModel = db.model("meetBook", sm.MeetBookSchema);
    meetBookModel.findById(arg.scheduleId, function(err, data) {
        db.close();
        var userId = data.participants; 
        var userIds = [];
        if(userId!=null||userId.length > 0){
        for (var i in participants) {
            var userId = technicist[i].userId;
            userIds.push(userId);
        } 
             var pushArg = {
                    appId : global.appId,
                    platforms : "0,1",
                    title : "有一场" + util.getMMddHHmmFromTimes(meetBookObj.startTime) 
                            + "开始" + meetBookObj.name +  "进行的会议需要参加，请及时查看。",
                    body :  new Date().getTime() + "_ChangeMeetingRoomManager",
                    userIds : userIds,
                    badgeNum : 3,
                    module : "MeetingRoomBooking",
                    subModule : "ChangeMeetingRoomManager",
                    type : "remind"
            };
        var jpushArg = {
            userid:arg.userId,
            userList:userIds,
            title:"",
            content:pushArg.title,
            type:0,
            msgType : "MeetingRoomBooking",
            subModule : "ChangeMeetingRoomManager"
        }; 
        if(global.pushType == "emm"){
            util.pushMsg(pushArg);
        }else{
            jpushUtil.jpush(jpushArg);
        }
       }
    });
    }
}

exports.Runner = run;
 