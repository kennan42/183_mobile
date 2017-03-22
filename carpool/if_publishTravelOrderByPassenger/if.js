var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");
var util = require("../../base/util.js");
var jpushUtil = require("../../jpush2/jpush_util.js");
var moment = require('moment');
/**
 *
 * 功能：发布约车信息(乘客)  5分钟后推送给司机
 * 作者：xialin
 * 时间：2016-4-8
   状态：完成
 */
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

//发布约车行程
function publishTravel(db, arg, serialNumber, Response) {
    //发布行程时约车

    
	
	var  date= new Date(parseInt(arg.startDate));
	var  startDateString =moment(date).format('YYYY-MM-DD HH:mm:ss')
	var startDateHour =moment(date).format('HHmm');
	var  setCloseTime = parseInt(arg.setCloseTime);  //搭车截止时间

	var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
	
    var travelEntity = new travelModel({

        userId : arg.userId,
        userName : arg.userName,
		company:arg.company,
        userType : 3, //1:约车司机;2:约车乘客;3.伪司机（发布者）
		carpoolType:2,  //约车
        startCityCode : arg.startCityCode,
        startCity : arg.startCity,
        startAddress : arg.startAddress,
        arriveCityCode : arg.arriveCityCode,
        arriveCity : arg.arriveCity,
        arriveAddress : arg.arriveAddress,
        startDate : parseInt(arg.startDate),
		startDateHour:parseInt(startDateHour),    //出发时间段
		startDateString:startDateString, //出发时间字符串
        travelSerialNumber : serialNumber, //行程流水号
        setCloseTime:setCloseTime,//设置截止时间
		
        bookedSeatCount : 1, //已经预定车位数
        seatState : 0, //0：未满 1已满
        
        state : 0, //0:正常     1:被踢     2:取消行程     3取消预约
        createdAt : new Date().getTime(),
        createUser : arg.userId,
        remark : arg.remark,
        startProvince : arg.startProvince,
        arriveProvince : arg.arriveProvince
    });

    //保存发布约车行程
    travelEntity.save(function(err, doc) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err) {
            //添加乘客搭车记录

            db.close();
            Response.end(JSON.stringify({
                status : "0",
                msg : "发布成功",
				msgStatus:"S4000101",
                travel : doc
            }));

            pushMsgDelay(doc._id,arg);
        } else {
            db.close();
            Response.end(JSON.stringify({
                status : "-1",
				msgStatus:"E4000101",
                msg : "发布失败"
            }));
        }
    });
}

//发布约车行程5分钟，还没有人接单，则推送给所有司机
function pushMsgDelay(travelId,arg) {
    console.log("------------------->推送司机");
    setTimeout(function() {
        //推送消息用户
     
        //本次行程的用户
        var driverList = [];
        var travelObject = null;
       
        async.series([
        //查询行程,同时查看是否过期，是否有人接单： 根据travelId查看carpoolType 是否为1，1表示拼车 
        function(callback) {
            var db = mongoose.createConnection(global.mongodbURL);
            var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
            var times = new Date().getTime();
            travelModel.findById(travelId, function(err, data) {
                db.close();
               
                if (data != null  && data.state == 0 && data.setCloseTime > times&& carpoolType==2) {
                    
                    travelObject = data;
                    callback(err, "");
                } else {
                    return;
                }
            });
        },
        //查询推送司机
        function(callback) {
            var db = mongoose.createConnection(global.mongodbURL);
            var userModel = db.model("carpoolUser", sm.CarpoolTralvelSchema);
           
            userModel.find({userId:{$ne:arg.userId}},{userId:-1}).exec(function(err, data) {
                db.close();
                for (var i in data) {
                    driverList.push(data[i].userId);
                }
                
                callback(err, "");
            });
        },
        //推送消息
        function(callback) {
           
              //有乘客发布MM月DD日HH时mm分PP到pp的约车信息，快来响应TA吧~
            var content = "有乘客发布" + util.getMMddHHmmFromTimes(parseInt(travelObject.startDate)) + "从" + travelObject.startCity + "到" + travelObject.arriveCity + "的约车信息，快来响应TA吧！";
            if (travelObject.startCityCode == travelObject.arriveCityCode) {
                content = "有乘客发布" + util.getMMddHHmmFromTimes(parseInt(travelObject.startDate)) + "从"+ travelObject.startAddress + "到" + travelObject.arriveAddress + "的约车信息，快来响应TA吧！";
            }
            var jpushArg = {
                userid : travelObject.userId,
                userList : driverList,
                title : "约车",
                content : content,
                type : 0,
                msgType : "Carpool",
                subModule : "CarpoolOrder"
            };

            jpushUtil.jpush(jpushArg);

            callback(null, "");
        }], function(err, data) {
            console.log("broadcast carpool info over");
        });
    }, 1000 * 60 *30);
}

exports.Runner = run;

