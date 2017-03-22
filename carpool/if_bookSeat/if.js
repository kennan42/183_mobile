var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");
var util = require("../../base/util.js");
var jpushUtil = require("../../jpush2/jpush_util.js");
var integralUtil = require("integralUtil");
/**
 * 开车详情-添加乘客  拼车(添加单个人) 司机添加乘客或乘客添加
 * @author xialin
 * @version 2016-04-05
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
                    carpoolType : 1, //拼车
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
                            if (type == '2') {
                                createUser = doc.userId;
                            } else {
                                createUser = userId;
                            }
                            doc.bookedSeatCount = doc.bookedSeatCount + 1;
                            if (doc.bookedSeatCount == seatCount) {//车位已满
                                doc.seatState = 1;
                            }

                            //记录乘客拼车数据

                            var travleEntity = new travelModel({
                                car : doc.car,
                                travel : travelId,
                                userId : userId,
                                userName : userName,
                                company : company,
                                userType : 2,
                                carpoolType : 1,
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

                                                if (doc.startCityCode == doc.arriveCityCode) {
                                                    content = "您已被" + doc.userName + "添加到" + util.getMMddHHmmFromTimes(doc.startDate) + "从" + doc.startAddress + "到" + doc.arriveAddress + "的行程中啦，记得打包行囊准时出发哟。";
                                                } else {
                                                    content = "您已被" + doc.userName + "添加到" + util.getMMddHHmmFromTimes(doc.startDate) + "从" + doc.startCity + "到" + doc.arriveCity + "的行程中啦，记得打包行囊准时出发哟。";
                                                }

                                                userCodeListStr = userId;
                                                subModule = "CarpoolPassenger";
                                            } else {

                                                if (doc.startCityCode == doc.arriveCityCode) {
                                                    content = userName + "预约您" + util.getMMddHHmmFromTimes(doc.startDate) + "从" + doc.startAddress + "到" + doc.arriveAddress + "的行程啦，出发时不要忘记TA哦。";
                                                } else {
                                                    content = userName + "预约您" + util.getMMddHHmmFromTimes(doc.startDate) + "从" + doc.startCity + "到" + doc.arriveCity + "的行程啦，出发时不要忘记TA哦。";
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

                                            //乘客添加积分
                                            if (type == '2') {
                                                //乘客
                                                var pp = {

                                                    "userId" : arg.userId,
                                                    "modelid" : "carpool",
                                                    "company" : arg.company,
                                                    "userName" : arg.userName,
                                                    "operationid" : "06"
                                                };
                                                integralUtil.addIntegralScore(pp, function(err, data) {
                                                });
                                                //司机
                                                var pp2 = {

                                                    "userId" : doc.userId,
                                                    "modelid" : "carpool",
                                                    "company" : doc.company,
                                                    "userName" : doc.userName,
                                                    "operationid" : "03"
                                                };
                                                integralUtil.addIntegralScore(pp2, function(err, data) {
                                                });
                                                
                                                
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

exports.Runner = run;

