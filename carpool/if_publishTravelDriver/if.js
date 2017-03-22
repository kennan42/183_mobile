var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");
var util = require("../../base/util.js");
var jpushUtil = require("../../jpush2/jpush_util.js");
var moment = require('moment');
var integralUtil = require("integralUtil");

/**
 *
 司机 接约车单      约车行程---变成确定行程，同时有个发起人标记，而且司机不能踢除发起人,userType:4
 * @author xialin
 * @version 2015年12月26日11:01
 状态：未完成
 入参：  arg.addedUser ：[{userId：xx ,userName:xx},{userId:xxx,userName}]
 arg.company  ：公司
 arg.remainingSearCount 剩余座位
 arg.car
 arg.startCityCode,

 * */
var arg = null;
var travelObj = null;
function run(Param, Robot, Request, Response, IF) {
    arg = JSON.parse(Param.body.toString());

    //1.取得相应的约车单，将约车单变成行程单
    //2.

    var createPassenger = arg.createPassenger;
    //发起人

    var db = mongoose.createConnection(global.mongodbURL);
    var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
    travelModel.findById(arg.travelId, function(err, doc) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err) {
            if (doc.state == 2) {
                db.close();
                Response.end(JSON.stringify({
                    status : "-1",
                    msgStatus : "E4000121",
                    msg : "预约失败，行程已被取消"
                }));
            } else if (arg.userId == doc.userId) {
                db.close();
                Response.end(JSON.stringify({
                    status : "-1",
                    msgStatus : "E4000122",
                    msg : "您不能预约自己发布的行程"
                }));

            } else {
                publishTravel(db, arg, doc.travelSerialNumber, Response, doc);
                //添加积分
                var pp = {

                    "userId" : doc.userId,
                    "modelid" : "carpool",
                    "company" : doc.company,
                    "userName" : doc.userName,
                    "operationid" : "08"
                };
                integralUtil.addIntegralScore(pp, function(err, data) {
                });
                var pp2 = {

                    "userId" : arg.userId,
                    "modelid" : "carpool",
                    "company" : arg.company,
                    "userName" : arg.userName,
                    "operationid" : "05"
                };
                integralUtil.addIntegralScore(pp2, function(err, data) {
                });
            }

        } else {
            db.close();
            Response.end(JSON.stringify({
                status : "-1",
                msgStatus : "E4000123",
                msg : "预约失败"
            }));

        }

    });

}

//发布行程
function publishTravel(db, arg, serialNumber, Response, doc) {
    //发布行程时添加的人
    var addedUser = arg.addedUser;
    var company = arg.company;
    //公司字段
    var remainingSearCount = parseInt(arg.remainingSearCount);
    //提供剩余车位
    var seatCount = remainingSearCount + addedUser.length;
    var seatState = 0;
    if (remainingSearCount == 0) {
        seatState = 1;
    }

    var date = new Date(parseInt(doc.startDate));

    var startDateString = moment(date).format('YYYY-MM-DD HH:mm:ss')
    var startDateHour = moment(date).format('HHmm');

    var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
    var travelEntity = new travelModel({
        car : arg.car,
        userId : arg.userId,
        userName : arg.userName,
        company : arg.company,
        userType : 1, //1:司机
        carpoolType : 1, //确定行程
        startProvince : doc.startProvince, //省份
        startCityCode : doc.startCityCode, //出发城市代码
        startCity : doc.startCity, //出发城市
        startAddress : doc.startAddress, //出发地点
        arriveProvince : doc.arriveProvince, //到达省份
        arriveCityCode : doc.arriveCityCode, //到达城市代码
        arriveCity : doc.arriveCity, //到达城市
        arriveAddress : doc.arriveAddress, //到达地点
        startDate : parseInt(doc.startDate), //出发时间
        startDateHour : parseInt(startDateHour), //出发时间段
        startDateString : startDateString, //出发时间字符串
        travelSerialNumber : serialNumber, //流水号
        seatCount : seatCount, //总座位数
        bookedSeatCount : addedUser.length, //乘客数
        seatState : seatState, //是否满座
        state : 0,
        createUser : arg.userId, //订单创建人
        remark : arg.remark, //备注
        createdAt : new Date().getTime()

    });

    //保存发布行程信息
    travelEntity.save(function(err, doc) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err) {
            //添加乘客打车记录
            if (addedUser.length > 0) {
                travelObj = doc;
                addPassenger(0, db, arg.addedUser, serialNumber, Response, doc);
            } else {
                db.close();
                Response.end(JSON.stringify({
                    status : "0",
                    msg : "发布成功",
                    msgStatus : "S4000113", //msg状态码
                    travel : doc
                }));
            }
            pushMsgDelay(doc._id);
        } else {
            db.close();
            Response.end(JSON.stringify({
                status : "-1",
                msg : "发布失败",
                msgStatus : "E4000124" //
            }));
        }
    });
}

function updateSelectUserType(i, db, addedUser, serialNumber, Response, doc) {

    var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);

    travelModel.update({
        userId : arg.createPassenger,
        company : arg.company,
        travelSerialNumber : serialNumber,
        carpoolType : 2,
        userType : 3
    }, {
        userType : 4,
        carpoolType : 1,
    }, {
        "multi" : true
    }, function(err) {

        if (!err) {
            i = i + 1;
            addPassenger(i, db, addedUser, serialNumber, Response, doc);
        } else {
            console.log("更改用户约车记录失败  " + err);

            db.close();
            Response.end(JSON.stringify({
                status : "-1",
                msgStatus : "E4000125",
                msg : "更改用户约车记录失败"
            }));
            return;
        }

    });

}

//保存发布行程时候的乘客信息
function addPassenger(i, db, addedUser, serialNumber, Response, doc) {
    i = i || 0;
    var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
    if (i < addedUser.length) {

        var userType = 2;
        if (addedUser[i].userId == arg.createPassenger) {
            //如果是发起人，更改原来约车单变成拼车行程单
            userType = 4;
            updateSelectUserType(i, db, addedUser, serialNumber, Response, doc);
        } else {

            var travleEntity = new travelModel({
                travel : doc._id,
                car : arg.car,
                userId : addedUser[i].userId,
                userName : addedUser[i].userName,
                company : addedUser[i].company, //公司字段
                userType : userType,
                carpoolType : 1,
                startProvince : doc.startProvince,
                startCityCode : doc.startCityCode,
                startCity : doc.startCity,
                startAddress : doc.startAddress,
                arriveProvince : doc.arriveProvince,
                arriveCityCode : doc.arriveCityCode,
                arriveCity : doc.arriveCity,
                arriveAddress : doc.arriveAddress,
                startDate : parseInt(doc.startDate),
                startDateHour : doc.startDateHour, //出发时间段
                startDateString : doc.startDateString, //出发时间字符串
                travelSerialNumber : serialNumber,
                state : 0,
                createdAt : new Date().getTime(),
                createUser : arg.userId //创建人

            });

            travleEntity.save(function(err) {
                if (!err) {
                    i = i + 1;
                    addPassenger(i, db, addedUser, serialNumber, Response, doc);
                } else {
                    db.close();
                    Response.end(JSON.stringify({
                        status : "-1",
                        msg : "发布失败",
                        msgStatus : "E4000126"
                    }));
                }
            });

        }

    } else {
        db.close();
        Response.end(JSON.stringify({
            status : "0",
            msg : "发布成功",
            msgStatus : "S4000114", //msg状态码
            travel : travelObj,
            addedUser : addedUser
        }));
        //推送消息通知乘客

        if (doc.startCityCode == doc.arriveCityCode) {

            var content = "司机" + arg.userName + "响应了" + util.getMMddHHmmFromTimes(parseInt(doc.startDate)) + "从" + doc.startAddress + "到" + doc.arriveAddress + "的约车行程，您已被添加为该行程乘客啦，记得准时到达出发地点哦。";

        } else {
            var content = "司机" + arg.userName + "响应了" + util.getMMddHHmmFromTimes(parseInt(doc.startDate)) + "从" + doc.startCity + "到" + doc.arriveCity + "的约车行程，您已被添加为该行程乘客啦，记得准时到达出发地点哦。";
        }

        var userIds = [];
        for (var i in addedUser) {
            userIds.push(addedUser[i].userId);
        }

        var jpushArg = {
            userid : arg.userId,
            userList : userIds,
            title : "",
            content : content,
            type : 0,
            msgType : "Carpool",
            subModule : "CarpoolPassenger"
        };

        jpushUtil.jpush(jpushArg);

    }
}

function pushMsgDelay(travelId) {
    console.log("------------------->pushMsgDelay");
    setTimeout(function() {
        //推送消息用户
        var userIds = null;
        //本次行程的用户
        var travelUserIds = [];
        var userIdsStr = null;
        var serialNumber = null;
        var travelObject = null;
        async.series([
        //查询行程
        function(callback) {
            var db = mongoose.createConnection(global.mongodbURL);
            var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
            var times = new Date().getTime();
            travelModel.findById(travelId, function(err, data) {
                db.close();
                console.log("times--->", times);
                console.log("travel--->", data);
                if (data != null && data.seatState == 0 && data.state == 0 && data.startDate > times) {
                    serialNumber = data.travelSerialNumber;
                    travelObject = data;
                    callback(err, "");
                } else {
                    return;
                }
            });
        },
        //查询本次行程的用户（乘客，司机，被踢的人）
        function(callback) {
            var db = mongoose.createConnection(global.mongodbURL);
            var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
            var query = travelModel.find({
                "state" : {
                    "$in" : [0, 1]
                },
                "travelSerialNumber" : serialNumber
            }, {
                _id : 0,
                userId : 1
            });
            query.exec(function(err, data) {
                db.close();
                for (var i in data) {
                    travelUserIds.push(data[i].userId);
                }
                console.log("travelUserIds--->", travelUserIds);
                userIdsStr = travelUserIds.join(",");
                console.log("userIdsStr--->", userIdsStr);
                callback(err, "");
            });
        },
        //查询推送用户
        function(callback) {
            var option = {
                CN : "Dsn=mysql-emm",
                sql : "select distinct(userId) from BindUser where appId = '" + global.appId + "'" + " and userId not in (" + userIdsStr + ")"
            };
            console.log("sql--->", option.sql);
            MEAP.ODBC.Runner(option, function(err, rows, cols) {
                if (!err) {
                    userIds = rows;
                    callback(err, null);
                } else {
                    return;
                }
            });
        },
        //推送消息
        function(callback) {
            var userIdArr = [];
            for (var i in userIds ) {
                userIdArr.push(userIds[i].userId);
            }
            var content = "有" + util.getMMddHHmmFromTimes(parseInt(travelObject.startDate)) + "从" + travelObject.startCity + "到" + travelObject.arriveCity + "的行程哦，打开天信-拼车就可以和TA同行啦！";
            if (travelObject.startCityCode == travelObject.arriveCityCode) {
                content = "有" + util.getMMddHHmmFromTimes(parseInt(travelObject.startDate)) + travelObject.startCity + travelObject.startAddress + "到" + travelObject.arriveAddress + "的行程哦，打开天信-拼车就可以和TA同行啦！";
            }

            var jpushArg = {
                userid : travelObject.userId,
                userList : userIdArr,
                title : "",
                content : content,
                type : 0,
                msgType : "Carpool",
                subModule : "CarpoolJourneyIssue"
            };

            jpushUtil.jpush(jpushArg);

            callback(null, "");
        }], function(err, data) {
            console.log("broadcast carpool info over");
        });
    }, 1000 * 60 * 30);
}

exports.Runner = run;

