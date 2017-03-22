var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");
var util = require("../../base/util.js");
var jpushUtil = require("../../jpush2/jpush_util.js");
/**
 * 预约约车  我是乘客（1.约到司机发布的  2.约到乘客发布的）
 * 作者：xialin
 * 时间：2015-12-28
   状态：已完成
 * 
 *
 * 入参：  arg.userId :我是乘客（约车人ID）
           arg.userName: 约车人name
		   arg.travelId:  约车记录ID
		   arg.addedUser  约车记录的已有乘客 ，格式：{
			    userId：xxx,
				userName:xxx
		   }
 *
 *
 *
 */
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var userName = arg.userName;
    var travelId = arg.travelId;
  

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
            } else if (userId == doc.userId) {
                db.close();
                Response.end(JSON.stringify({
                    status : "-1",
                    msg : "您不能预约自己发布的行程"
                }));

            } else {

                //判断是否已经预定了
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
                        if (data.length >= 1) {
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

                            //发布
                            publishTravelOrder(db, arg, serialNumber, Response, doc);

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

//更改选中用户在约车中的记录---约车成功--userType:4

function updateSelectUserType(db, doc, arg, str, addedUser, Response) {
    var oldSerialNumber = doc.travelSerialNumber;
    var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
    //修改记录 。然后重新发布
    travelModel.update({
        userId : {
            $in : addedUser.userId
        },
        travelSerialNumber : oldSerialNumber,
        carpoolType : 2,
        userType : 2
    }, {
        $set : {
            userType : 4
        }
    }, {
        "multi" : true
    }, function(err) {

        if (!err) {

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
                        publishTravel(db, doc, arg, str, Response);
                    });
                } else {
                    var seriaEntity = new seriaNumberModel({
                        seriaNumber : 1
                    });
                    seriaEntity.save(function(err, seriaEntity) {
                        publishTravel(db, doc, arg, "00000001", Response);
                    });
                }
            });

        } else {
            console.log("更改用户约车记录失败  " + err);

            db.close();
            Response.end(JSON.stringify({
                status : "-1",
                msg : "更改用户约车记录失败"
            }));

        }

    });

}

//发布行程
function publishTravel(db, doc, arg, serialNumber, Response) {
    
    var addedUser = arg.addedUser;
	//将约车人添加进去
    addedUser.push({
		  userId:arg.userId,
		  userName:arg.userName
	});

    var seatCount = doc.seatCount;
    var seatState = 1;
    var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
    var travelEntity = new travelModel({
        car : doc.car,
        userId : doc.userId,
        userName : doc.userName,
        userType : 1,
        carpoolType : 1,
        setUserNumber : doc.setUserNumber,
        startCityCode : doc.startCityCode,
        startCity : doc.startCity,
        startAddress : doc.startAddress,
        arriveCityCode : doc.arriveCityCode,
        arriveCity : doc.arriveCity,
        arriveAddress : doc.arriveAddress,
        startDate : parseInt(doc.startDate),
        travelSerialNumber : serialNumber,
        twoDimensionalCode : "",
        seatCount : seatCount,
        bookedSeatCount : addedUser.length,
        seatState : seatState,

        state : 0,
        createdAt : doc.createdAt,
        createUser : doc.createUser,
        remark : doc.remark,
        startProvince : doc.startProvince,
        arriveProvince : doc.arriveProvince
    });

    //保存发布行程信息
    travelEntity.save(function(err, doc) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err) {
            //添加乘客打车记录
            if (addedUser.length > 0) {
                travelObj = doc;
                addPassenger(0, db, addedUser, serialNumber, Response, doc);
            } else {
                db.close();
                Response.end(JSON.stringify({
                    status : "0",
                    msg : "发布成功",
                    travel : doc
                }));
            }

        } else {
            db.close();
            Response.end(JSON.stringify({
                status : "-1",
                msg : "发布失败"
            }));
        }
    });
}

//保存发布行程时候的乘客信息
function addPassenger(i, db, addedUser, serialNumber, Response, doc) {
    i = i || 0;
    var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
    if (i < addedUser.length) {
        var originalTwoDimensionalCode = serialNumber + "," + doc.userId + "," + addedUser[i].userId;
        var base64TwoDimensionalCode = new Buffer(originalTwoDimensionalCode).toString('base64');
        base64TwoDimensionalCode = "CTTQ01001" + base64TwoDimensionalCode;
        var travleEntity = new travelModel({
            travel : doc._id,
            car : doc.car,
            userId : addedUser[i].userId,
            userName : addedUser[i].userName,
            userType : 2,
            carpoolType : 1,
            startCityCode : doc.startCityCode,
            startCity : doc.startCity,
            startAddress : doc.startAddress,
            arriveCityCode : doc.arriveCityCode,
            arriveCity : doc.arriveCity,
            arriveAddress : doc.arriveAddress,
            startDate : parseInt(doc.startDate),
            travelSerialNumber : serialNumber,
            twoDimensionalCode : base64TwoDimensionalCode,
            state : 0,
            validateState : 0,
            createdAt : doc.createdAt,
            createUser : doc.userId,
            startProvince : doc.startProvince,
            arriveProvince : doc.arriveProvince
        });

        travleEntity.save(function(err) {
            if (!err) {
                i = i + 1;
                addPassenger(i, db, addedUser, serialNumber, Response, doc)
            } else {
                db.close();
                Response.end(JSON.stringify({
                    status : "-1",
                    msg : "发布失败"
                }));
            }
        });
    } else {
        db.close();
        Response.end(JSON.stringify({
            status : "0",
            msg : "发布成功",
            travel : travelObj
        }));
        //推送消息通知乘客:您预约的MM月DD日HH时mm分PP到pp的约车行程已满足司机出发条件，请您准时到达集合地点哦~
        //推送给司机：您发布的MM月DD日HH时mm分PP到pp的约车行程已满足出发条件，请您别忘记准时出发哦~
        var content = "您预约的" + util.getMMddHHmmFromTimes(parseInt(doc.startDate)) + "从" + doc.startCity + "到" + doc.arriveCity + "的约车行程已满足司机出发条件，请您准时到达集合地点哦~";

        var content2 = "您发布的" + util.getMMddHHmmFromTimes(parseInt(doc.startDate)) + "从" + doc.startCity + "到" + doc.arriveCity + "的约车行程已满足出发条件，请您别忘记准时出发哦~";

        var userIds = [];
        for (var i in addedUser) {
            userIds.push(addedUser[i].userId);
        }

        var jpushArg = {
            userid : arg.userId,
            userList : userIds,
            title : "预约约车",
            content : content,
            type : 0,
            msgType : "Carpool",
            subModule : "CarpoolOrderTrans"
        };

        var jpushArg2 = {
            userid : arg.userId,
            userList : [doc.createUser],
            title : "预约约车",
            content : content2,
            type : 0,
            msgType : "Carpool",
            subModule : "CarpoolOrderTrans"
        }
        jpushUtil.jpush(jpushArg);
        jpushUtil.jpush(jpushArg2);
    }
}

//添加乘客 (约车)
function addPassengerByOrder(db, arg, serialNumber, Response, doc) {

    
    //记录乘客拼车数据
    var createUser = doc.userId;

    var travelSerialNumber = doc.travelSerialNumber;
    var travleEntity = new travelModel({
        car : doc.car,
        travel : travelId,
        userId : userId,
        userName : userName,
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
        validateState : 0,
        travelSerialNumber : doc.travelSerialNumber,
        twoDimensionalCode : "",
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

                    Response.end(JSON.stringify({
                        status : "0",
                        msg : "预约成功",
                        data : travleEntity
                    }));

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

function publishTravelOrder(db, arg, serialNumber, Response, doc) {

    var userType = doc.userType;

    if (userType == 1) {
        //如果是司机发布的，判断是否满人，如果满人，变成拼车
        doc.bookedSeatCount = doc.bookedSeatCount + 1;
        var setUserNumber = doc.setUserNumber;
        //设定多少人
		//如果不是司机，不用判断满人，直接在原来约车记录上加
        if (setUserNumber == doc.bookedSeatCount) {
            //达到发车人数
   
            updateSelectUserType(db, doc, arg, str, addedUser, Response);

        } else {
            //未达到，继续添加
            addPassengerByOrder(db, arg, serialNumber, Response, doc);

        }

    } else {

        doc.bookedSeatCount = doc.bookedSeatCount + 1;
        addPassengerByOrder(db, arg, serialNumber, Response, doc);

    }

}

exports.Runner = run;

