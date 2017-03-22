var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");
var async = require('async');
var util = require("../../base/util.js");

function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var meetingRoomIds = null;
    var bookedRoomIds = null;
    var db = mongoose.createConnection(global.mongodbURL);
    var MeetRoomModel = db.model("meetRoom", sm.MeetRoomSchema);
    var MeetBookModel = db.model("meetBook", sm.MeetBookSchema);
    Response.setHeader("Content-type", "text/json;charset=utf-8");
    async.series([
    //1查询符合条件的会议室
    function(callback) {
        var queryForMeetingRoom = {};
        if (arg.guishudiCode) {
            queryForMeetingRoom.guishudiId = arg.guishudiCode;
        }
        if (arg.needApply) {
            queryForMeetingRoom.needApply = parseInt(arg.needApply);
        }
        if (arg.type) {
            queryForMeetingRoom.type = parseInt(arg.type);
        }
        if (arg.level) {
            queryForMeetingRoom.level = parseInt(arg.level);
        }
        var startTime = parseInt(arg.startTime);
        var endTime = parseInt(arg.endTime);
        queryForMeetingRoom.$or = [{
            "state" : 1
        }, {
            "state" : 2,
            "frozenBegin" : {
                "$gte" : endTime
            }
        }, {
            "state" : 2,
            "frozenEnd" : {
                "$lte" : startTime
            }
        }];
        MeetRoomModel.find(queryForMeetingRoom, function(err, meetingRooms) {
            if (!err && meetingRooms.length > 0) {
                meetingRoomIds = [];
                if (arg.equipment != null && arg.equipment.length > 0) {
                    getAvalibleMeetingRooms(i, arg.equipment, meetingRooms, meetingRoomIds);
                } else {
                    for (var i in meetingRooms ) {
                        meetingRoomIds.push(meetingRooms[i]._id);
                    }
                }
                if (meetingRoomIds.length == 0) {
                    Response.end(JSON.stringify({
                        status : '-1',
                        msg : '没有符合查询条件的会议室'
                    }));
                    return;
                }
                callback(err, '');
            } else {
                db.close();
                Response.end(JSON.stringify({
                    status : '-1',
                    msg : '没有符合查询条件的会议室'
                }));
                return;
            }
        });
    },
    //查询已经被预约的会议室
    function(callback) {
        var queryForBookedMeetingRoom = {};
        queryForBookedMeetingRoom.startTime = {
            '$lte' : parseInt(arg.endTime)
        };
        queryForBookedMeetingRoom.endTime = {
            '$gte' : parseInt(arg.startTime)
        };
        queryForBookedMeetingRoom.state = 2;
        MeetBookModel.find(queryForBookedMeetingRoom, {
            '_id' : 1
        }, function(err, ids) {
            bookedRoomIds = ids;
            callback(err, '');
        });
    },
    //查询可以预约的会议室
    function(callback) {
        for (var i in bookedRoomIds) {
            util.removeAllElementFromArray(bookedRoomIds[i], meetingRoomIds);
        }
        if (meetingRoomIds.length == 0) {
            db.close();
            Response.end(JSON.stringify({
                status : '-1',
                msg : '没有符合查询条件的会议室'
            }));
            return;
        } else {
            var pageNumber = arg.pageNumber;
            var pageSie = arg.pageSize;
            var skip = (pageNumber-1)*pageSie;
            MeetRoomModel.find({
                '_id' : {
                    '$in' : meetingRoomIds
                }
            }).skip(skip).limit(pageSie).sort({guishudiOrder:1,index:1}).exec(function(err, rooms) {
                db.close();
                Response.end(JSON.stringify({
                    status : '0',
                    msg : '查询成功',
                    data : rooms
                }));
                return;
            });
        }

    }], function() {

    });
}

/**
 * 筛选符合条件的会议室列表，即会议室里应该包括equipment里面的设备
 * */
function getAvalibleMeetingRooms(i, equipment, meetingRooms, rs) {
    i = i || 0;
    if (i < meetingRooms.length) {
        if (meetingRooms[i].device != null && meetingRooms[i].device.length > 0) {
            var item = meetingRooms[i].device;
            var num = 0;
            for (var j in equipment) {
                for (var k in item) {
                    if (equipment[j].name == item[k].name) {
                        num++;
                        break;
                    }
                }
            }
            if (num == equipment.length) {
                rs.push(meetingRooms[i]._id);
            }
            i++;
            getAvalibleMeetingRooms(i, equipment, meetingRooms, rs);
        } else {
            i++;
            getAvalibleMeetingRooms(i, equipment, meetingRooms, rs);
        }

    } 
}

exports.Runner = run;

