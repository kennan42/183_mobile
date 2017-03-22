var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");
var util = require("../../base/util.js");
var jpushUtil = require("../../jpush2/jpush_util.js");

/**
 * 发布行程
 * @author wangdonghua
 * @version 2014年12月26日11:01
 * */
var arg = null;
var travelObj = null;
function run(Param, Robot, Request, Response, IF) {
    
    console.log("------->publishTravel");
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
    var remainingSearCount = parseInt(arg.remainingSearCount);
    var seatCount = remainingSearCount + addedUser.length;
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
        startCityCode : arg.startCityCode,
        startCity : arg.startCity,
        startAddress : arg.startAddress,
        arriveCityCode : arg.arriveCityCode,
        arriveCity : arg.arriveCity,
        arriveAddress : arg.arriveAddress,
        startDate : parseInt(arg.startDate),
        travelSerialNumber : serialNumber,
        twoDimensionalCode : "",
        seatCount : seatCount,
        bookedSeatCount : addedUser.length,
        seatState : seatState,
        filter : arg.filter,
        state : 0,
        createdAt : new Date().getTime(),
        createUser : arg.userId,
        remark : arg.remark,
        startProvince : arg.startProvince,
        arriveProvince : arg.arriveProvince
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
                    travel : doc
                }));
            }
            pushMsgDelay(doc._id);
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
        var originalTwoDimensionalCode = serialNumber + "," + arg.userId + "," + addedUser[i].userId;
        var base64TwoDimensionalCode = new Buffer(originalTwoDimensionalCode).toString('base64');
        base64TwoDimensionalCode = "CTTQ01001" + base64TwoDimensionalCode;
        var travleEntity = new travelModel({
            travel : doc._id,
            car : arg.car,
            userId : addedUser[i].userId,
            userName : addedUser[i].userName,
            userType : 2,
            startCityCode : arg.startCityCode,
            startCity : arg.startCity,
            startAddress : arg.startAddress,
            arriveCityCode : arg.arriveCityCode,
            arriveCity : arg.arriveCity,
            arriveAddress : arg.arriveAddress,
            startDate : parseInt(arg.startDate),
            travelSerialNumber : serialNumber,
            twoDimensionalCode : base64TwoDimensionalCode,
            state : 0,
            validateState : 0,
            createdAt : new Date().getTime(),
            createUser : arg.userId,
            startProvince : arg.startProvince,
            arriveProvince : arg.arriveProvince
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
		var pushArg = {
                appId : global.appId,
                platforms : "0,1",
                title : "您已被" + arg.userName + "添加到" + util.getMMddHHmmFromTimes(parseInt(arg.startDate)) 
                        + "从" + arg.startCity + "到" + arg.arriveCity + "的行程中啦，记得打包行囊准时出发哟。",
                body : new Date().getTime() + "_CarpoolJourneyIssueAddPassenger",
                badgeNum : 3,
                module:"Carpool",
                subModule:"CarpoolJourneyIssueAddPassenger",
                type:"remind"
            };
			var userIds = [];
        for (var i in addedUser) {
            userIds.push(addedUser[i].userId);
        }
		pushArg.userIds = userIds;
		// util.pushMsg(pushArg);
		var jpushArg = {
			userid:arg.userId,
			userList:userIds,
			title:"",
			content:pushArg.title,
			type:0
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
                console.log("times--->",times);
                console.log("travel--->",data);
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
        function(callback){
            var db = mongoose.createConnection(global.mongodbURL);
            var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
            var query = travelModel.find({"state":{"$in":[0,1]},"travelSerialNumber":serialNumber},{_id:0,userId:1});
            query.exec(function(err,data){
                db.close();
                for(var i in data){
                     travelUserIds.push(data[i].userId);
                }
                console.log("travelUserIds--->",travelUserIds);
                userIdsStr = travelUserIds.join(",");
                console.log("userIdsStr--->",userIdsStr);
                callback(err,"");
            });
        },
        //查询推送用户
        function(callback) {
            var option = {
                CN : "Dsn=mysql-emm",
                sql : "select distinct(userId) from BindUser where appId = '" +  
                        global.appId + "'" + " and userId not in (" + userIdsStr + ")"
            };
            console.log("sql--->",option.sql);
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
			var title = "有" + util.getMMddHHmmFromTimes(parseInt(travelObject.startDate)) + "从" + travelObject.startCity 			+ "到" + travelObject.arriveCity + "的行程哦，打开天信-拼车就可以和TA同行啦！";
				if(travelObject.startCityCode == travelObject.arriveCityCode){
					title = "有" + util.getMMddHHmmFromTimes(parseInt(travelObject.startDate)) + travelObject.startCity 
							+ travelObject.startAddress + "到" + travelObject.arriveAddress + "的行程哦，打开天信-拼车就可以和TA同行啦！";
				}
                var pushArg = {
                    appId : global.appId,
                    platforms : "0,1",
                    title : title,
                    body:new Date().getTime() + "_CarpoolJourneyIssue",
					userIds:userIdArr,
                    badgeNum : 3,
                    module:"Carpool",
                    subModule:"CarpoolJourneyIssue",
                    type:"remind"
                };
                //util.pushMsg(pushArg);
				var jpushArg = {
					userid:travelObject.userId,
					userList:userIdArr,
					title:"",
					content:pushArg.title,
					type:0
				};
				jpushUtil.jpush(jpushArg);
            callback(null,"");
        }], function(err, data) {
                console.log("broadcast carpool info over");
        });
    }, 1000 * 60 * 30);
}

exports.Runner = run;

