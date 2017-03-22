var MEAP = require("meap");
var async = require("async");
var mongoose = require("mongoose");
var carpoolSchema = require("../carpoolSchema.js");
var util = require("../../base/util.js");
var jpushUtil = require("../../jpush2/jpush_util.js");

var res = null;
var db = null;
var currentTime = null;
var serialNumber = null;
var startTimes = null;
function run(Param, Robot, Request, Response, IF) {
    async.parallel([
    function(cb) {
        res = Response;
        db = mongoose.createConnection(global.mongodbURL);
        var autoPublishTravelModel = db.model('carpoolAutoPublishTravel', carpoolSchema.CarpoolAutoPublishTravelSchema);

        var date = new Date();
        var day = date.getDay() + '';
        var hours = date.getHours();
        if (hours < 10) {
            hours = '0' + hours;
        }
        var minutes = date.getMinutes();
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        currentTime = hours + ':' + minutes;
        autoPublishTravelModel.find({}, function(err, data) {
            if (!err) {
                if (data.length > 0) {
					res.end('start auto publish travel ');
                    autoPublishTravel(0, data);
                } else {
                    db.close();
                    res.end('no data to publish');
                }
            } else {
                db.close();
                res.end('query data fail');
            }
			cb(null,"");
        });
    },
    function(cb) {
        remindTravel();
        cb(null, "");
    }], function(err, data) {
			console.log("handle over");
    });

}

function remindTravel() {
    var db1 = mongoose.createConnection(global.mongodbURL);
    var travelModel = db1.model("carpoolTravel", carpoolSchema.CarpoolTralvelSchema);
    var times = new Date().getTime();
    var times1 = times + 25 * 60 * 1000;
    var times2 = times + 30 * 60 * 1000;
    var date1 = new Date();
    date1.setTime(times1);
    date1.setSeconds(0);
    date1.setMilliseconds(0);
    var date2 = new Date();
    date2.setTime(times2);
    date2.setSeconds(0);
    date2.setMilliseconds(0);
    var val1 = date1.getTime();
    var val2 = date2.getTime();
    var travels = null;
    async.series([
    //查询距离半小时出发的行程
    function(callback) {
        var query = travelModel.find({
            "state" : 0,
            "startDate" : {
                "$gte" : val1,
                "$lt" : val2
            }
        });
        query.exec(function(err, data) {
            db1.close();
            travels = data;
            callback(err, "");
        });
    },
    //推送消息
    function(callback) {
        for (var i in travels) {
            var userType = travels[i].userType;
            var subModule = "CarpoolJourneyRemind";
            //提醒乘客
            if (userType == 1) {
                subModule = "CarpoolJourneyRemind2";
                //提醒司机
            }
            var userIds = [];
            userIds.push(travels[i].userId);
            var pushArg = {
                appId : global.appId,
                platforms : "0,1",
                title : "您" + util.getMMddHHmmFromTimes(travels[i].startDate) + "从" + travels[i].startCity + "到" + travels[i].arriveCity + "的车马上就要出发啦，请及时赶到出发地点以免耽误行程",
                body : new Date().getTime() + "_" + subModule,
                userIds : userIds,
                badgeNum : 3,
                module : "Carpool",
                subModule : subModule,
                type : "remind"
            };
           // util.pushMsg(pushArg);
		   var jpushArg = {
			   userid:"tianxin",
			   userList:userIds,
			   title:"",
			   content:pushArg.title,
			   type:0
		   };
		   jpushUtil.jpush(jpushArg);
        }
    }]);
}

function autoPublishTravel(i, datas) {
    i = i || 0;
    if (i < datas.length) {
        var item = null;
        var startTime = null;
        var date = new Date();
        var currentHours = date.getHours();
        if (currentHours < 10) {
            currentHours = '0' + currentHours;
        }
        var currentMinutes = date.getMinutes();
        if (currentMinutes < 10) {
            currentMinutes = '0' + currentMinutes;
        }
        var currentTime = currentHours + ':' + currentMinutes;
        var day = date.getDay() + '';
        var day1 = day;
        var frequency = null;
        var startHours = null;
        var startMinutes = null;
        var startTimeArr = null;
        var travelModel = db.model("carpoolTravel", carpoolSchema.CarpoolTralvelSchema);
        var seriaNumberModel = db.model("carpoolSeriaNumber", carpoolSchema.CarpoolSeriaNumberSchema);
        startTime = datas[i].startTime;
        startTimeArr = startTime.split(':');
        startHours = parseInt(startTimeArr[0]);
        startMinutes = parseInt(startTimeArr[1]);
        async.series([
        function(callback) {
            var index = inArr(day1, datas[i].frequency);
            //当天需要发布行程
            if (index == -1) {
                while (true) {
                    parseInt(day1);
                    day1++;
                    if (day1 == 7) {
                        day1 = '' + 0;
                    } else {
                        day1 = day1 + '';
                    }
                    index = inArr(day1, datas[i].frequency);
                    if (index != -1) {
                        break;
                    }
                }
            }
            var dateInterval = parseInt(datas[i].frequency[index]) - parseInt(day);
            if (dateInterval < 0) {
                dateInterval += 7;
            }
            if (dateInterval == 0 && currentTime > startTime) {//今天发出时间已过,发布下一次行程
                var day2 = date.getDay() + 1 + '';
                var index2 = inArr(day2, datas[i].frequency);
                if (index2 == -1) {
                    while (true) {
                        parseInt(day2);
                        day2++;
                        if (day2 == 7) {
                            day2 = '' + 0;
                        } else {
                            day2 = day2 + '';
                        }
                        index2 = inArr(day2, datas[i].frequency);
                        if (index2 != -1) {
                            break;
                        }
                    }
                }
                dateInterval = parseInt(datas[i].frequency[index2]) - parseInt(day);
                if (dateInterval < 0) {
                    dateInterval += 7;
                }
            }
            var intervalTimes = dateInterval * 24 * 3600 * 1000;
            date.setHours(startHours);
            date.setMinutes(startMinutes);
            date.setSeconds(0);
            date.setMilliseconds(0);
            startTimes = date.getTime() + intervalTimes;
            var query = {
                autoPublishTravelId : datas[i]._id,
                startDate : startTimes
            };
            travelModel.findOne(query, function(err, data) {
                //已经发布过该行程
                if (data == null) {
                    callback(err, '');
                } else {
                    console.log("has published");
                    i++;
                    autoPublishTravel(i, datas);
                }
            });
        },
        //获取行程流水号
        function(callback) {
            console.log('--->get travel serial number');
            seriaNumberModel.findOne({}, function(err, serialNumberDoc) {
                serialNumberDoc.seriaNumber = serialNumberDoc.seriaNumber + 1;
                serialNumberDoc.save(function(err) {
                    serialNumber = serialNumberDoc.seriaNumber + '';
                    if (serialNumber.length < 8) {
                        var tmp = "";
                        for (var j = 0; j < 8 - serialNumber.length; j++) {
                            tmp += "0";
                        }
                        serialNumber = tmp + serialNumber;
                    }
                    callback(err, '');
                });
            });
        },
        //发布行程
        function(callback) {
            console.log('--->start auto publish travel');
            var arg = datas[i];
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
                startDate : startTimes,
                travelSerialNumber : serialNumber,
                twoDimensionalCode : "",
                seatCount : arg.seatCount,
                bookedSeatCount : 0,
                seatState : 0,
                filter : arg.filter,
                state : 0,
                createdAt : new Date().getTime(),
                createUser : arg.userId,
                remark : arg.remark,
                startProvince : arg.startProvince,
                arriveProvince : arg.arriveProvince,
                autoPublishTravelId : datas[i]._id
            });
            travelEntity.save(function(err, travelEntity) {
                pushMsgDelay(travelEntity, datas[i].createdAt);
                callback(err, '');
            });
        }], function(err, data) {
            i++;
            autoPublishTravel(i, datas);
        });
    } else {
        db.close();
    }
}

//判断元素是否在数组里
function inArr(el, arr) {
    if (el == null || arr == null) {
        return -1;
    } else {
        for (var i in arr) {
            if (el == arr[i]) {
                return i;
            }
        }
        return -1;
    }
}

function pushMsgDelay(travel, createTime) {
    //判断是否为今天的行程，只对今天以后的行程进行提醒
    var startTime = travel.startDate;
    var startDate = new Date();
    startDate.setTime(startTime);
    if (startDate.getDate() == new Date().getDate()) {
        return;
    }

    var travelId = travel._id;
    //计算自动行程的发布时间
    var date1 = new Date();
    date1.setTime(createTime);
    var hour1 = date1.getHours();
    var min1 = date1.getMinutes();

    //计算推送消息的时间
    var date2 = new Date();
    date2.setHours(hour1);
    date2.setMinutes(min1);
    date2.setSeconds(0);
    date2.setMilliseconds(0);
    var times = date2.getTime() + 30 * 60 * 1000;
    var intervalTimes = times - new Date().getTime();

    setTimeout(function() {
        //推送消息用户
        var userIds = null;
        //本次行程的用户
        var travelUserIds = [];
        var userIdsStr = null;
        var serialNumber = null;
        async.series([
        //查询行程
        function(callback) {
            var db = mongoose.createConnection(global.mongodbURL);
            var travelModel = db.model("carpoolTravel", carpoolSchema.CarpoolTralvelSchema);
            var times = new Date().getTime();
            travelModel.findById(travelId, function(err, data) {
                db.close();
                if (data != null && data.seatState == 0 && data.state == 0 && data.startDate > times) {
                    serialNumber = data.travelSerialNumber;
                    callback(err, "");
                } else {
                    return;
                }
            });
        },
        //查询本次行程的用户（乘客和）
        function(callback) {
            var db = mongoose.createConnection(global.mongodbURL);
            var travelModel = db.model("carpoolTravel", carpoolSchema.CarpoolTralvelSchema);
            var query = travelModel.find({
                "state" : 0,
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
                userIdsStr = travelUserIds.join(",");
                callback(err, "");
            });
        },
        //查询推送用户
        function(callback) {
            var option = {
                CN : "Dsn=mysql-emm",
                sql : "select distinct(userId) from BindUser where appId = '" + global.appId + "'" + " and userId not in (" + userIdsStr + ")"
            };
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
            var pushArg = {
                appId : global.appId,
                platforms : "0,1",
                title : "有" + util.getMMddHHmmFromTimes(parseInt(travel.startDate)) + "从" + travel.startCity + "到" + travel.arriveCity + "的行程哦，打开天信-拼车就可以和TA同行啦！",
                body : new Date().getTime() + "_CarpoolJourneyIssue",
                badgeNum : 3,
                module : "Carpool",
                subModule : "CarpoolJourneyIssue",
                type : "remind"
            };
            var users = [];
            for (var i in userIds ) {
                users.push(userIds[i].userId);
            }
            pushArg.userIds = users;
            //util.pushMsg(pushArg);
			var jpushArg = {
				userid:travel.userId,
				userList:users,
				title:"",
				content:pushArg.title,
				type:0
			};
			jpushUtil.jpush(jpushArg);
            callback(null, "");
        }], function(err, data) {
			console.log("push msg over");
        });
    }, intervalTimes);
}

exports.Runner = run;

