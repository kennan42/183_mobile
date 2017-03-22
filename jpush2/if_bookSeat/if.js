var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");
var util = require("../../base/util.js");
var jpushUtil = require("../../jpush2/jpush_util.js");

/**
 * 预约车位
 * @author wangdonghua
 * @version 2014年12月26日09:45
 * */
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var userName = arg.userName;
    var travelId = arg.travelId;
    //1 司机添加   2乘客搭车
    var type = arg.type;

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
                    msg : "预约失败，行程已被取消"
                }));
            } else if (bookedSeatCount >= seatCount) {
                db.close();
                Response.end(JSON.stringify({
                    status : "-1",
                    msg : "预约失败，没有多余车位"
                }));
            } else {
                var driverId = doc.userId;
                if (userId == driverId) {
                    db.close();
                    Response.end(JSON.stringify({
                        status : "-1",
                        msg : "不能预约自己的车作为乘客"
                    }));
                    return;
                }
                //判断是否被踢过或者已经预约了该车位
                var serialNumber = doc.travelSerialNumber;
                travelModel.find({
                    travelSerialNumber : serialNumber,
                    userId : userId,
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
                            var msg = "你已经预定过该车位";
                            if (state == 1) {
                                msg = "你被踢过";
                            }
                            Response.end(JSON.stringify({
                                status : "-1",
                                msg : msg
                            }));
                        } else {
                            var createUser = "";
                            if (type == '1') {
                                createUser = doc.userId;
                            } else {
                                createUser = userId;
                            }
                            doc.bookedSeatCount = doc.bookedSeatCount + 1;
                            if (doc.bookedSeatCount == seatCount) {//车位已满
                                doc.seatState = 1;
                            }

                            //记录乘客拼车数据
                            var travelSerialNumber = doc.travelSerialNumber;
                            var originalTwoDimensionalCode = doc.travelSerialNumber + "," + doc.userId + "," + userId;
                            var base64TwoDimensionalCode = new Buffer(originalTwoDimensionalCode).toString('base64');
                            base64TwoDimensionalCode = "CTTQ01001" + base64TwoDimensionalCode;
                            var travleEntity = new travelModel({
                                car : doc.car,
                                travel : travelId,
                                userId : userId,
                                userName : userName,
                                userType : 2,
                                startCityCode : doc.startCityCode,
                                startCity : doc.startCity,
                                startAddress : doc.startAddress,
                                arriveCityCode : doc.arriveCityCode,
                                arriveCity : doc.arriveCity,
                                arriveAddress : doc.arriveAddress,
                                startDate : doc.startDate,
                                state : 0,
                                validateState : 0,
                                travelSerialNumber : doc.travelSerialNumber,
                                twoDimensionalCode : base64TwoDimensionalCode,
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
                                            var title = "";
                                            if (type == "1") {
                                                title = "您已被" + doc.userName + "添加到" + util.getMMddHHmmFromTimes(doc.startDate) 
                                                        + "从" + doc.startCity + "到" + doc.arriveCity + "的行程中啦，记得打包行囊准时出发哟。";
                                                userCodeListStr = userId;
                                                subModule = "CarpoolJourneyIssueAddPassenger";
                                            } else {
                                                title = userName + "预约您" + util.getMMddHHmmFromTimes(doc.startDate) + "从" +  doc.startCity 
                                                        + "到" +doc.arriveCity +  "的行程啦，出发时不要忘记TA哦。";
                                                userCodeListStr = doc.userId;
                                                subModule = "CarpoolBookSeat";
                                            }
                                            Response.end(JSON.stringify({
                                                status : "0",
                                                msg : "预约成功",
                                                data : travleEntity
                                            }));
											var userIds =[];
											userIds.push(userCodeListStr);
                                            var pushArg = {
                                                appId : global.appId,
                                                platforms : "0,1",
                                                title : title,
                                                body :new Date().getTime() + "_" + subModule,
                                                userIds : userIds,
                                                badgeNum : 3,
                                                module : "Carpool",
                                                subModule : subModule,
                                                type:"remind"
                                            };
                                           // util.pushMsg(pushArg);
                                           var jpushArg = {
                                               userid:arg.userId,
											   userList:userIds,
											   title:"",
											   content:pushArg.title,
											   type:0
                                           };
										   jpushUtil.jpush(jpushArg);
                                        } else {
                                            Response.end(JSON.stringify({
                                                status : "-1",
                                                msg : "预约失败"
                                            }));
                                        }
                                    });
                                } else {
                                    db.close();
                                    Response.end(JSON.stringify({
                                        status : "-1",
                                        msg : "预约失败"
                                    }));
                                }
                            });
                        }

                    } else {
                        db.close();
                        Response.end(JSON.stringify({
                            status : "-1",
                            msg : "查询相关信息失败"
                        }));
                    }
                });
            }
        } else {
            db.close();
            Response.end(JSON.stringify({
                status : "-1",
                msg : "预约失败"
            }));
        }
    });
}

exports.Runner = run;

