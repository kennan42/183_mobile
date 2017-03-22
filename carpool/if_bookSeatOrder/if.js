var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");
var util = require("../../base/util.js");
var jpushUtil = require("../../jpush2/jpush_util.js");
var integralUtil = require("integralUtil");
/**
 * 不确定行程： 司机添加乘客或 乘客预约座位，如果达到目标人数，转为确定行程
 注意不确定行程有截止时间，添加人的时候判断截止时间

 * @author xialin
 * @version 2016-04-07
 状态：已完成
 * */
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var userName = arg.userName;
    var travelId = arg.travelId;
    //1 司机添加   2乘客搭车
    var type = arg.type;
    var company = arg.company;
    //公司

    //var haveUsers =arg.haveUsers; //已有乘客

    var db = mongoose.createConnection(global.mongodbURL);
    var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
    travelModel.findById(travelId, function(err, doc) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err) {
            var seatCount = doc.seatCount;
            var bookedSeatCount = doc.bookedSeatCount;
            if (doc.state == 2) {
                db.close();
                Response.end(JSON.stringify({
                    status : "-1",
                    msgStatus : "E4000107",
                    msg : "预约失败，行程已被取消"
                }));
            } else if (bookedSeatCount >= seatCount) {
                db.close();
                Response.end(JSON.stringify({
                    status : "-1",
                    msgStatus : "E4000108",
                    msg : "预约失败，没有多余车位"
                }));
            } else {
                var driverId = doc.userId;
                if (userId == driverId) {
                    db.close();
                    Response.end(JSON.stringify({
                        status : "-1",
                        msgStatus : "E4000109",
                        msg : "不能预约自己的车作为乘客"
                    }));
                    return;
                }
                //判断是否被踢过或者已经预约了该车位
                var serialNumber = doc.travelSerialNumber;
                travelModel.find({
                    travelSerialNumber : serialNumber,
                    userId : userId,
                    carpoolType : 2, //拼车
                    userType : 2,
                    state : {
                        $in : [0, 1]
                    }
                }).exec(function(err, data) {
                    if (!err) {
                        if (data.length >= 1 && type == "2") {
                            db.close();
                            var rs = data[0];
                            var state = rs.state;

                            if (state == 1) {

                                Response.end(JSON.stringify({
                                    status : "-1",
                                    msgStatus : "E4000110",
                                    msg : "对不起，您被踢过不能再次预约"
                                }));
                            } else {

                                Response.end(JSON.stringify({
                                    status : "-1",
                                    msgStatus : "E4000111",
                                    msg : "你已经预定过该车位"
                                }));
                            }

                        } else {
                            var createUser = "";
                            if (type == '1') {
                                //司机-创建人就是自己
                                createUser = doc.userId;
                            } else {
                                //乘客-创建人就是乘客
                                createUser = userId;
                            }
                            doc.bookedSeatCount = doc.bookedSeatCount + 1;

                            if (doc.bookedSeatCount == seatCount) {//车位已满
                                doc.seatState = 1;
                            }

                            publishTravel(db, arg, serialNumber, Response, doc);
                            //乘客添加积分
                            if (type == '2') {
                                //乘客
                                var pp = {

                                    "userId" : arg.userId,
                                    "modelid" : "carpool",
                                    "company" : arg.company,
                                    "userName" : arg.userName,
                                    "operationid" : "07"
                                };
                                integralUtil.addIntegralScore(pp, function(err, data) {
                                });

                                //司机
                                var pp2 = {

                                    "userId" : doc.userId,
                                    "modelid" : "carpool",
                                    "company" : doc.company,
                                    "userName" : doc.userName,
                                    "operationid" : "04"
                                };
                                integralUtil.addIntegralScore(pp2, function(err, data) {
                                });

                            }

                        }

                    } else {
                        db.close();
                        Response.end(JSON.stringify({
                            status : "-1",
                            msgStatus : "E4000114",
                            msg : "查询相关信息失败"
                        }));
                    }
                });
            }
        } else {
            db.close();
            Response.end(JSON.stringify({
                status : "-1",
                msgStatus : "E4000115",
                msg : "预约失败"
            }));
        }
    });
}

//保存乘客信息
function publishTravel(db, arg, serialNumber, Response, doc) {

    var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
    var travleEntity = new travelModel({
        car : doc.car,
        travel : arg.travelId,
        userId : arg.userId,
        userName : arg.userName,
        company : arg.company,
        userType : 2,
        carpoolType : 2,
        startCityCode : doc.startCityCode,
        startCity : doc.startCity,
        startAddress : doc.startAddress,
        arriveCityCode : doc.arriveCityCode,
        arriveCity : doc.arriveCity,
        arriveAddress : doc.arriveAddress,
        startDate : doc.startDate,
        state : 0,
        travelSerialNumber : doc.travelSerialNumber,

        createdAt : new Date().getTime(),
        createUser : createUser,
        startProvince : doc.startProvince,
        arriveProvince : doc.arriveProvince
    });

    doc.save(function(err) {
        if (!err) {
            travleEntity.save(function(err, travleEntity) {
                db.close();
                if (!err) {
                    //推送消息
                    var userCodeListStr = "";
                    var subModule = "";
                    var content = "";
                    if (type == "1") {
                        //司机AA将您添加到MM月DD日HH时mm分PP到pp的不确定行程内，请您注意此行程状态~
                        if (doc.startCityCode == doc.arriveCityCode) {
                            content = "司机" + doc.userName + "将您添加到" + util.getMMddHHmmFromTimes(doc.startDate) + "从" + doc.startAddress + "到" + doc.arriveAddress + "的不确定行程内，请您注意此行程状态~";
                        } else {
                            content = "司机" + doc.userName + "将您添加到" + util.getMMddHHmmFromTimes(doc.startDate) + "从" + doc.startCity + "到" + doc.arriveCity + "的不确定行程内，请您注意此行程状态~";
                        }

                        userCodeListStr = userId;
                        subModule = "CarpoolPassenger";
                    } else {
                        //AA预约了您MM月DD日HH时mm分PP到pp的约车行程哦。
                        if (doc.startCityCode == doc.arriveCityCode) {
                            content = userName + "预约了您" + util.getMMddHHmmFromTimes(doc.startDate) + "从" + doc.startAddress + "到" + doc.arriveAddress + "的不确定行程哦";
                        } else {
                            content = userName + "预约了您" + util.getMMddHHmmFromTimes(doc.startDate) + "从" + doc.startCity + "到" + doc.arriveCity + "的不确定行程哦";
                        }

                        userCodeListStr = doc.userId;
                        subModule = "CarpoolDriver";
                    }
                    Response.end(JSON.stringify({
                        status : "0",
                        msg : "预约成功",
                        msgStatus : "S4000107",
                        data : travleEntity
                    }));
                    var userIds = [];
                    userIds.push(userCodeListStr);

                    var jpushArg = {
                        userid : arg.userId,
                        userList : userIds,
                        title : "",
                        content : content,
                        type : 0,
                        msgType : "Carpool",
                        subModule : subModule
                    };

                    jpushUtil.jpush(jpushArg);

                    if (doc.bookedSeatCount == doc.setUserNumber) {
                        updateSelectUserType(db, arg, serialNumber, Response, doc);
                    }

                } else {
                    Response.end(JSON.stringify({
                        status : "-1",
                        msgStatus : "E4000112",
                        msg : "预约失败"
                    }));
                }
            });
        } else {
            db.close();
            Response.end(JSON.stringify({
                status : "-1",
                msgStatus : "E4000113",
                msg : "预约失败"
            }));
        }
    });

}

//转为拼车单，先将用户全部更改，再单独添加乘客
function updateSelectUserType(db, arg, serialNumber, Response, doc) {

    var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);

    travelModel.update({

        travelSerialNumber : serialNumber,
        carpoolType : 2,
        userType : {
            $in : [1, 2]
        }
    }, {

        carpoolType : 1,
    }, {
        "multi" : true
    }, function(err) {
        //将添加的乘客也加入进行程
        if (!err) {

            //您预约的MM月DD日HH时mm分PP到pp的约车行程已满足司机出发条件，请您准时到达集合地点哦~
            var haveUsers = arg.haveUsers;

            if (type == "1") {
                var content = "";
                haveUsers.push(arg.userId);
                //司机添加-发送乘客
                if (doc.startCityCode == doc.arriveCityCode) {
                    content = "您预约的" + util.getMMddHHmmFromTimes(doc.startDate) + "从" + doc.startAddress + "到" + doc.arriveAddress + "的不确定行程已满足司机出发条件，请您准时到达集合地点哦~";
                } else {
                    content = "您预约的" + util.getMMddHHmmFromTimes(doc.startDate) + "从" + doc.startCity + "到" + doc.arriveCity + "的不确定行程已满足司机出发条件，请您准时到达集合地点哦~";
                }

                var jpushArg = {
                    userid : arg.userId,
                    userList : haveUsers,
                    title : "",
                    content : content,
                    type : 0,
                    msgType : "Carpool",
                    subModule : "CarpoolPassenger"
                };

                jpushUtil.jpush(jpushArg);

            } else {
                //乘客添加，除了乘客本人之外，要推送给其他乘客和司机

                var driverUser = doc.userId;
                var content = "";
                var content2 = "";
                if (doc.startCityCode == doc.arriveCityCode) {
                    content = "您发布的" + util.getMMddHHmmFromTimes(doc.startDate) + "从" + doc.startAddress + "到" + doc.arriveAddress + "的不确定行程已满足出发条件，请准时出发。";
                    content2 = "您预约的" + util.getMMddHHmmFromTimes(doc.startDate) + "从" + doc.startAddress + "到" + doc.arriveAddress + "的不确定行程已满足司机出发条件，请您准时到达集合地点哦~";
                } else {
                    content = "您发布的" + util.getMMddHHmmFromTimes(doc.startDate) + "从" + doc.startCity + "到" + doc.arriveCity + "的不确定行程已满足出发条件，请准时出发。";
                    content2 = "您预约的" + util.getMMddHHmmFromTimes(doc.startDate) + "从" + doc.startCity + "到" + doc.arriveCity + "的不确定行程已满足司机出发条件，请您准时到达集合地点哦~";
                }

                var jpushArg = {
                    userid : arg.userId,
                    userList : driverUser,
                    title : "",
                    content : content,
                    type : 0,
                    msgType : "Carpool",
                    subModule : "CarpoolDriver"
                };

                var jpushArg2 = {
                    userid : arg.userId,
                    userList : haveUsers,
                    title : "",
                    content : content2,
                    type : 0,
                    msgType : "Carpool",
                    subModule : "CarpoolPassenger"
                };

                jpushUtil.jpush(jpushArg);
                jpushUtil.jpush(jpushArg2);

            }

        } else {
            //
            db.close();
            Response.end(JSON.stringify({
                status : "-1",
                msgStatus : "E4000113",
                msg : "预约失败"
            }));
            return;
        }

    });

}

exports.Runner = run;

