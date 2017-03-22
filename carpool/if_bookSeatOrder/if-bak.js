var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");
var util = require("../../base/util.js");
var jpushUtil = require("../../jpush2/jpush_util.js");

/**
 * 约车 我是司机（转为拼车，人数太多时，选部分乘客，同时将以前约车单保留）
 * 作者 xialin
 * 时间 2015年12月31日
 * 状态： 已完成
 *  入参：  arg.oldUserList 旧的所有用户列表（包括发布者）
 *          arg.newUserList; //新的所有用户列表 （不包括司机）
 *          arg.userId;
 *          arg.userName
            arg.travelId  :约车单id
			arg.remainingSearCount  剩余车位
			arg.car  车
 *
 * */



var delUserList = [];
//剔除的乘客
//var addedUser = [];
//额外添加的新的乘客
var selectUserList = [];
//选择的已存在乘客

function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var userName = arg.userName;
    var travelId = arg.travelId;

    var oldUserList = arg.oldUserList;
    //旧的所有用户列表（包括发布者）
    var newUserList = arg.newUserList;
    //新的所有用户列表 （不包括司机）

    //查询用户
    findUser(oldUserList, newUserList, delUserList, selectUserList);

    var db = mongoose.createConnection(global.mongodbURL);
    var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);

    travelModel.findById(travelId, function(err, doc) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err) {

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

                //判断乘客中是否已经存在userId
                var serialNumber = doc.travelSerialNumber;
                travelModel.find({
                    travelSerialNumber : serialNumber,
                    userId : userId,
                    userType : {
                        $in : [2, 3]
                    },
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

                            //因为自己是司机，所以约车发布为拼车，自己为发布人
                            // var createUser = userId;

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

                                        //发布
                                        publishTravelTrans(db, doc, arg, str, delUserList, selectUserList, Response);

                                    });
                                } else {
                                    var seriaEntity = new seriaNumberModel({
                                        seriaNumber : 1
                                    });
                                    seriaEntity.save(function(err, seriaEntity) {
                                        //发布
                                        publishTravelTrans(db, doc, arg, "00000001", delUserList, selectUserList, Response);
                                    });
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

//发布拼车行程 同时更改约车行程
function publishTravelTrans(db, doc, arg, str, delUserList, selectUserList, Response) {

    //所有情况：1.剔除乘客，有选旧乘客  2.剔除乘客 都T了 3.都没踢

    if (delUserList.length > 0) {
        //有剔除用户
        //在数据库中将原来的选择用户更新为4
        updateSelectUserType(db, doc, arg, str, delUserList, selectUserList, Response);

    } else {
        //无剔除用户
        publishTravel(db, arg, str, Response);
    }

}

function findUser(oldUserList, newUserList, delUserList, selectUserList) {

    var oldUser =[];
	var  newUser =[];
	
	for (var i = 0; i < oldUserList.length; i++) {
		
		oldUser.push(oldUserList[i].userId);
	}

     for (var i = 0; i < newUserList.length; i++) {
		
		newUser.push(newUserList[i].userId);
	}
	
	
	
	
    for (var i = 0; i < oldUser.length; i++) {

        for (var j = 0; j < newUser.length; j++) {
            if (newUser[j] == oldUser[i]) {
                selectUserList.push(oldUser[i]);
            }
        };
    };

    for (var i = 0; i < oldUser.length; i++) {
        var flag = 0;
        for (var j = 0; j < selectUserList.length; j++) {

            if (oldUser[i] == selectUserList[j]) {
                flag = 1;
                break;
            }
        };
        if (flag == 0) {
            delUserList.push(oldUser[i]);
        }
    };


}

//更改选中用户在约车中的记录---约车成功--userType:4

function updateSelectUserType(db, doc, arg, str, delUserList, selectUserList, Response) {
    var oldSerialNumber = doc.travelSerialNumber;
    var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);

    travelModel.update({
        userId : {
            $in : selectUserList
        },
        travelSerialNumber : oldSerialNumber,
        carpoolType : 2
    }, {
        userType : 4
    }, {
        "multi" : true
    }, function(err) {

        if (!err) {
            //修改原来的乘客约车发布者
            updateDeleteUserType(db, doc, arg, str, delUserList, Response);
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

//修改原来的乘客约车发布者
function updateDeleteUserType(db, doc, arg, str, delUserList, Response) {

    //判断原来的约车创建者是否还在
    var oldCreatUser = doc.createUser;

    // delUserList
    var flag = 0;
    for (var i = 0; i < delUserList.length; i++) {
        if (delUserList[i] == oldCreatUser) {
            flag = 1;
			break;
            //如果有，说明剔除乘客中有原来创建者
        }
    }
    if (flag == 0) {
        //如果没有那么，修改约车创建者，
        var newCreater = delUserList[0];
        doc.createUser = newCreater;
        var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
        //且修改新的乘客类型 为3
        travelModel.update({
            travelSerialNumber : oldSerialNumber,
            carpoolType : 2,
            userId : newCreater
        }, {
            userType : 3
        }, function(err, data) {
            if (!err) {

                //发布拼车
                publishTravel(db,doc, arg, str, Response);

            } else {
                db.close();
                Response.end(JSON.stringify({
                    status : "-1",
                    msg : "修改原来的乘客约车发布者失败"
                }));

            }

        });

    } else {
        //如果有，继续保持原来发布者
        publishTravel(db,doc, arg, str, Response);
    }

}

//发布拼车行程
function publishTravel(db, doc,arg, serialNumber, Response) {
    //发布行程时添加的人
  

    var remainingSearCount = parseInt(arg.remainingSearCount);
    var seatCount = remainingSearCount + arg.newUserList.length;
    //获取座位数
    var seatState = 0;
    if (remainingSearCount == 0) {
        seatState = 1;
    }

    var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
    var travelEntity = new travelModel({
        car : arg.car,
        userId : arg.userId,
        userName : arg.userName,
        userType : 1,
        carpoolType : 1,
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
        bookedSeatCount : arg.newUserList.length,
        seatState : seatState,

        state : 0,
        createdAt : new Date().getTime(),
        createUser : arg.userId,
        remark : doc.remark,
        startProvince : doc.startProvince,
        arriveProvince : doc.arriveProvince
    });

    //保存发布行程信息
    travelEntity.save(function(err, doc) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err) {
            //添加乘客搭车记录
            if (arg.newUserList.length > 0) {
                travelObj = doc;
                addPassenger(0, db, arg, serialNumber, Response, doc);
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
function addPassenger(i, db, arg, serialNumber, Response, doc) {
    i = i || 0;
    var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
	var addedUser = arg.newUserList;
    if (i < addedUser.length) {
        var originalTwoDimensionalCode = serialNumber + "," + arg.userId + "," + addedUser[i].userId;
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
            createdAt : new Date().getTime(),
            createUser : arg.userId,
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
        //推送消息通知乘客
        //司机AA响应了您MM月DD日HH时mm分PP到pp的约车行程，您已被添加为该行程乘客啦，记得准时到达出发地点哦~
        var content = "司机" + arg.userName + "响应了您" + util.getMMddHHmmFromTimes(parseInt(doc.startDate)) + "从" + doc.startCity + "到" + doc.arriveCity + "的约车行程，您已被添加为该行程乘客啦，记得准时到达出发地点哦。";

        var userIds = [];
        for (var i in addedUser) {
            userIds.push(addedUser[i].userId);
        }
        pushArg.userIds = userIds;
        var jpushArg = {
            userid : arg.userId,
            userList : userIds,
            title : "CarpoolOrderTrans",
            content : content,
            type : 0,
            msgType : "Carpool",
            subModule : "CarpoolOrderTrans"
        };

        jpushUtil.jpush(jpushArg);

    }
}

exports.Runner = run;

