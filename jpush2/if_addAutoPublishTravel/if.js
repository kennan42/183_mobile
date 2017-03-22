var MEAP=require("meap");
var async = require("async");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../carpoolSchema.js");
var util = require("../../base/util.js");
var jpushUtil = require("../../jpush2/jpush_util.js");
var serialNumber = null;
var travelId = null;
var autoPublishTravelId = null;
var seatCount = null;
function run(Param, Robot, Request, Response, IF)
{
    var arg = JSON.parse(Param.body.toString());	
    var db = mongoose.createConnection(global.mongodbURL);
    var bookedSeatCount = arg.addedUser.length;
    var remainingSeatCount = parseInt(arg.remainingSearCount);
    seatCount = bookedSeatCount + remainingSeatCount;
    var autoPublishTravelModel = db.model("carpoolAutoPublishTravel", sm.CarpoolAutoPublishTravelSchema);
    var autoPublishTravelEntity = new autoPublishTravelModel({
        car:arg.car,
        userId:arg.userId,
        userName:arg.userName,
        startProvince:arg.startProvince,
        startCityCode:arg.startCityCode,
        startCity:arg.startCity,
        startAddress:arg.startAddress,
        arriveProvince:arg.arriveProvince,
        arriveCityCode:arg.arriveCityCode,
        arriveCity:arg.arriveCity,
        arriveAddress:arg.arriveAddress,
        startTime:arg.startTime,
        seatCount:seatCount,
        filter:arg.filter,
        frequency:arg.frequency,
        addedUser:arg.addedUser,
        isScaned:0,
        status:1,
        createdAt:new Date().getTime(),
        remark:arg.remark
    });
    autoPublishTravelEntity.save(function(err,data){
        db.close();
        if(!err){
            autoPublishTravelId = data._id;
            Response.end(JSON.stringify({
                status:"0",
                msg:"添加成功",
                autoPublishTravelId:data._id                
            }));
             getFirstStartTimes(arg);
        }else{
            Response.end(JSON.stringify({
                status:"-1",
                msg:"添加失败"
            }));
        }
    });
}

//计算第一次发布行程的时间
function getFirstStartTimes(arg){
    console.log('--->getFirstStartTimes start ');
    var frequency = arg.frequency;
    var startTimeStr = arg.startTime;
    var arr = startTimeStr.split(":");
    var startHour = parseInt(arr[0]);
    var startTime = parseInt(arr[1]);
    
    var date = new Date();
    var day = date.getDay() + '';
    var hour = date.getHours();
    var minute = date.getMinutes();
    if(hour < 10){
        hour = '0' + hour;
    }
    if(minute < 10){
        minute = '0' + minute;
    }
    var currentTime = '' + hour + ':' + minute; 
    //设置时间为出发时间
    date.setHours(startHour);
    date.setMinutes(startTime);
    date.setSeconds(0);
    date.setMilliseconds(0);
    var firstStartTime = 0;
    var firstStartIndex = 0;
    var dayInArray = inArr(day,frequency);
    //判断当天是否可以出发
    if(dayInArray != -1 && currentTime < startTimeStr){
        firstStartIndex = dayInArray;
    }else{//下次出发
        var tpmDay = parseInt(day);
        tpmDay++;
        var dayNextIndex = getNextDayIndex(tpmDay,frequency);
        firstStartIndex = dayNextIndex;
    }
    var dateInterval = parseInt(frequency[firstStartIndex]) - parseInt(day);
    if(dateInterval < 0){
        dateInterval += 7;
    }
    if(frequency.length == 1 && day == frequency[0] && currentTime > startTimeStr ){
        dateInterval = 7;
    }
    var intervalTiems = dateInterval*24*3600*1000;
    firstStartTime = date.getTime() + intervalTiems;
     console.log('--->getFirstStartTimes end ');
    publishFirstTravel(firstStartTime,arg);    
}

function publishFirstTravel(firstStartTime,arg){
     console.log('--->publishFirstTravel start ');
    var db = mongoose.createConnection(global.mongodbURL);
    async.series([
      //得到行程流水号
      function(callback){
        console.log('--->get serialNumber');
        var seriaNumberModel = db.model("carpoolSeriaNumber", sm.CarpoolSeriaNumberSchema);
        seriaNumberModel.findOne({},function(err,data){
            data.seriaNumber = data.seriaNumber + 1;
              data.save(function(err){
                  serialNumber = data.seriaNumber + "";
                    if (serialNumber.length < 8) {
                        var tmp = "";
                        for (var j = 0; j < 8 - serialNumber.length; j++) {
                            tmp += "0";
                        }
                        serialNumber = tmp + serialNumber;
                    }
                    callback(null,'');
              });
        });
      //添加行程数据  
    },function(callback){
        console.log('--->add carpool travel');
        var travelModel = db.model("carpoolTravel",sm.CarpoolTralvelSchema);
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
            startDate : firstStartTime,
            travelSerialNumber : serialNumber,
            twoDimensionalCode : "",
            seatCount : seatCount,
            bookedSeatCount : arg.addedUser.length,
            seatState :seatCount==arg.addedUser.length?1:0,
            filter : arg.filter,
            state : 0,
            createdAt : new Date().getTime(),
            createUser : arg.userId,
            remark : arg.remark,
            startProvince:arg.startProvince,
            arriveProvince:arg.arriveProvince,
            autoPublishTravelId:autoPublishTravelId
        });
        travelEntity.save(function(err,data){
            if(!err){
                travelId = data._id;
                callback(err,'');
            }else{
                db.close();
                return;
            }
        });
    },
    //添加乘客信息
    function(callback){
        console.log('--->goto add passenger');
        if(arg.addedUser.length > 0){
            addPassenger(0,arg.addedUser, firstStartTime, arg, callback);
        }else{
            callback(null,'');
        }
    }],function(err,data){
        console.log(" add auto publish travle over");
        db.close();
    });
}

//保存发布行程时候的乘客信息
function addPassenger(i,addedUser, times, arg, callback) {
    console.log('--->add passenger start',i);
    var db1;
    if(db1 == null){
        db1 = mongoose.createConnection(global.mongodbURL);
    }
    i = i || 0;
    var travelModel = db1.model("carpoolTravel", sm.CarpoolTralvelSchema);
    if (i < addedUser.length) {
        console.log("--------------in add passenger process ");
        var originalTwoDimensionalCode = serialNumber + "," + arg.userId + "," + addedUser[i].userId;
        var base64TwoDimensionalCode = new Buffer(originalTwoDimensionalCode).toString('base64');
        base64TwoDimensionalCode = "CTTQ01001" + base64TwoDimensionalCode;
        console.log("add passenger 111");
        var travleEntity = new travelModel({
            travel : travelId,
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
            startDate : times,
            travelSerialNumber : serialNumber,
            twoDimensionalCode : base64TwoDimensionalCode,
            state : 0,
            validateState : 0,
            createdAt : new Date().getTime(),
            createUser : arg.userId,
            startProvince : arg.startProvince,
            arriveProvince : arg.arriveProvince
        });
        console.log("add passenger 222");
        travleEntity.save(function(err) {
            console.log("add passenger 333",err);
            if (!err) {
                i = i + 1;
                addPassenger(i, addedUser, times, arg, callback)
            } else {
                console.log("add passenger error",err);
                db1.close();
                callback(0, "");
                return;
            }
        });
    } else {
        console.log("addedUser over");
         /*
         * 推送消息通知乘客
         * */
		 var userIds = [];
		 var pushArg = {
             appId : global.appId,
             platforms : "0,1",
             title : "您已被" + arg.userName + "添加到" + util.getMMddHHmmFromTimes(parseInt(times))
                 + "从" +  arg.startCity + "到" + arg.arriveCity + "的行程中啦，记得打包行囊准时出发哟。",
             body :new Date().getTime()  + "_CarpoolJourneyIssueAddPassenger",
             badgeNum : 3,
             module:"Carpool",
             subModule:"CarpoolJourneyIssueAddPassenger",
			 type:"remind"
         };
         for (var k in addedUser) {
				userIds.push(addedUser[k].userId);
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
         db1.close();
        callback(null, "");
    }
}

//返回数组的下一个元素，如果是最后一个，择返回第一个
function getNextDayIndex(e,arr){
    if(e == null || arr == null){
        return -1;
    }else{
        for(var i in arr){
            if(e == arr[i]){
                return i;
            }
        }
        if(e == '7'){
            e = '0';
        }else{
            parseInt(e);
            e++;
            e = e + '';
        }
        return getNextDayIndex(e,arr);
    }
}

//判断元素是否在数组里
function inArr(el,arr){
    if(el == null || arr == null){
        return -1;
    }else{
        for(var i in arr){
            if(el == arr[i]){
                return i;
            }
        }
        return -1;
    }
}

exports.Runner = run;


                                

	

