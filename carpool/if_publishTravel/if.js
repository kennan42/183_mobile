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
 * 发布行程 (拼车-我要开车 )
 司机发布行程
 * @author xialin
 * @version 2015年12月26日11:01
 状态：已完成
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
    var db = mongoose.createConnection(global.mongodbURL);
    //生成流水号
    var seriaNumberModel = db.model("carpoolSeriaNumber", sm.CarpoolSeriaNumberSchema);
    seriaNumberModel.find({}).sort({
        serialNumber : -1
    }).limit(1).exec(function(err, datas) {
        if (!err && datas.length > 0) {
            var seriaEntity = datas[0];
            seriaEntity.seriaNumber = seriaEntity.seriaNumber + 1;
            seriaEntity.save(function(err, seriaEntity) {
                var seriaNumber = '' + seriaEntity.seriaNumber;
                if (seriaNumber.length < 8) {
                    var tmp = "";
                    for (var i = 0; i < 8 - seriaNumber.length; i++) {
                        tmp += "0";
                    }
                    str = tmp + seriaNumber;
                }
                publishTravel(db, arg, str, Response);
            });
        } else {
            var seriaEntity = new seriaNumberModel({
                seriaNumber : 1
            });
            seriaEntity.save(function(err, seriaEntity) {
                publishTravel(db, arg, "00000001", Response);
            });
        }
    });

}

//发布行程
function publishTravel(db, arg, serialNumber, Response) {
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

    var date = new Date(parseInt(arg.startDate));

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
        startProvince : arg.startProvince, //省份
        startCityCode : arg.startCityCode, //出发城市代码
        startCity : arg.startCity, //出发城市
        startAddress : arg.startAddress, //出发地点
        arriveProvince : arg.arriveProvince, //到达省份
        arriveCityCode : arg.arriveCityCode, //到达城市代码
        arriveCity : arg.arriveCity, //到达城市
        arriveAddress : arg.arriveAddress, //到达地点
        startDate : parseInt(arg.startDate), //出发时间
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
                    msgStatus : "S4000101", //msg状态码
                    travel : doc
                }));
            }

            var pp = {

                "userId" : arg.userId,
                "modelid" : "carpool",
                "company" : arg.company,
                "userName":arg.userName,
                "operationid":"01"
            };
            integralUtil.addIntegralScore(pp, function(err,data) {});
            pushMsgDelay(doc._id);

        } else {
            db.close();
            Response.end(JSON.stringify({
                status : "-1",
                msg : "发布失败",
                msgStatus : "E4000101" //
            }));
        }
    });
}

//保存发布行程时候的乘客信息
function addPassenger(i, db, addedUser, serialNumber, Response, doc) {
    i = i || 0;
    var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
    if (i < addedUser.length) {

        var travleEntity = new travelModel({
            travel : doc._id,
            car : arg.car,
            userId : addedUser[i].userId,
            userName : addedUser[i].userName,
            company : addedUser[i].company, //公司字段
            userType : 2,
            carpoolType : 1,
            startProvince : arg.startProvince,
            startCityCode : arg.startCityCode,
            startCity : arg.startCity,
            startAddress : arg.startAddress,
            arriveProvince : arg.arriveProvince,
            arriveCityCode : arg.arriveCityCode,
            arriveCity : arg.arriveCity,
            arriveAddress : arg.arriveAddress,
            startDate : parseInt(arg.startDate),
            startDateHour : arg.startDateHour, //出发时间段
            startDateString : arg.startDateString, //出发时间字符串
            travelSerialNumber : serialNumber,
            state : 0,
            createdAt : new Date().getTime(),
            createUser : arg.userId //创建人

        });

        travleEntity.save(function(err) {
            if (!err) {
                i = i + 1;
                addPassenger(i, db, addedUser, serialNumber, Response, doc)
            } else {
                db.close();
                Response.end(JSON.stringify({
                    status : "-1",
                    msg : "发布失败",
                    msgStatus : "E4000101"
                }));
            }
        });
    } else {
        db.close();
        Response.end(JSON.stringify({
            status : "0",
            msg : "发布成功",
            msgStatus : "S4000101", //msg状态码
            travel : travelObj,
            addedUser : addedUser
        }));
        //推送消息通知乘客

        if (arg.startCityCode == arg.arriveCityCode) {
            var content = "您已被" + arg.userName + "添加到" + util.getMMddHHmmFromTimes(parseInt(arg.startDate)) + "从" + arg.startAddress + "到" + arg.arriveAddress + "的行程中啦，记得打包行囊准时出发哟。";
        } else {
            var content = "您已被" + arg.userName + "添加到" + util.getMMddHHmmFromTimes(parseInt(arg.startDate)) + "从" + arg.startCity + "到" + arg.arriveCity + "的行程中啦，记得打包行囊准时出发哟。";
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

