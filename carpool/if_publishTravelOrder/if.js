var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");
var util = require("../../base/util.js");
var jpushUtil = require("../../jpush2/jpush_util.js");
var moment = require('moment');
var integralUtil = require("integralUtil");
/**
 * 
 * 功能：发布约车信息(司机) 暂定开车
 * 作者：xialin
 * 时间：2015-12-28 11：20
   状态：完成
   入参：  
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
    
    var setUserNumber = parseInt(arg.setUserNumber); //发车人数限制
	var  setCloseTime = parseInt(arg.setCloseTime);  //搭车截止时间

	var  seatCount  =parseInt(arg.seatCount);//提供座位数
    var  seatState = 0; //未满
	var state =0; //正常
    var bookedSeatCount=0; //乘客数为0
	var  date= new Date(parseInt(arg.startDate));
	var  startDateString =moment(date).format('YYYY-MM-DD HH:mm:ss')
	var startDateHour =moment(date).format('HHmm');
	
	
     var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
     
    var travelEntity = new travelModel({
        car : arg.car,
        userId : arg.userId,
        userName : arg.userName,
		company:arg.company,
        userType : 1,  //1:约车司机;2:约车乘客
		carpoolType :2,   //不确定行程
		setCloseTime:setCloseTime,//设置截止时间
		setUserNumber:setUserNumber, 
		
        startProvince:arg.startProvince,  //省份
        startCityCode : arg.startCityCode, //出发城市代码
        startCity : arg.startCity,           //出发城市
        startAddress : arg.startAddress,    //出发地点
		arriveProvince:arg.arriveProvince,  //到达省份
        arriveCityCode : arg.arriveCityCode,  //到达城市代码
        arriveCity : arg.arriveCity,           //到达城市
        arriveAddress : arg.arriveAddress,       //到达地点
        startDate : parseInt(arg.startDate),   //出发时间
		startDateHour:parseInt(startDateHour),    //出发时间段
		startDateString:startDateString, //出发时间字符串
        travelSerialNumber : serialNumber,  //流水号
        seatCount : seatCount,       //总座位数
        bookedSeatCount : bookedSeatCount,  //乘客数为0
        seatState : seatState,       //是否满座
        state : 0,
		createUser : arg.userId,    //订单创建人
        remark : arg.remark,         //备注
        createdAt : new Date().getTime()
    });

    //保存发布行程信息
    travelEntity.save(function(err, doc) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
		 db.close();
        if (!err) {
            //添加乘客搭车记录
                Response.end(JSON.stringify({
                    status : "0",
                    msg : "发布成功",
					msgStatus:"S4000101",
                    travel : doc
                }));
            
			
				pushMsgDelay(doc._id);
				var pp = {

                "userId" : arg.userId,
                "modelid" : "carpool",
                "company" : arg.company,
                "userName":arg.userName,
                "operationid":"02"
            };
            integralUtil.addIntegralScore(pp, function(err,data) {});
			
            
        } else {
           
            Response.end(JSON.stringify({
                status : "-1",
                msg : "发布失败",
				msgStatus:"E4000101"  
            }));
        }
    });
}




//发布约车行程5分钟，推送给所有人
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
		//还差多少人
		var  pNumber = null;
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
					pNumber =data.seatCount-data.bookedSeatCount;
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
            
            
            //有司机发布MM月DD日HH时mm分PP到pp的约车信息，还差B人就可以成行啦，快来搭车吧~
               var content = "有司机发布" + util.getMMddHHmmFromTimes(parseInt(travelObject.startDate)) + "从" + travelObject.startCity 
                          + "到" + travelObject.arriveCity + "的约车信息，还差"+pNumber+"人就可以成行啦，快来搭车吧！";
                if(travelObject.startCityCode == travelObject.arriveCityCode){
                    content = "有司机发布" + util.getMMddHHmmFromTimes(parseInt(travelObject.startDate)) + travelObject.startCity 
                            + travelObject.startAddress + "到" + travelObject.arriveAddress + "的约车信息，还差"+pNumber+"人就可以成行啦，快来搭车吧！";
                }
             
                var jpushArg = {
                    userid:travelObject.userId,
                    userList:userIdArr,
                    title:"",
                    content:content,
                    type:0,
                    msgType:"Carpool",
                    subModule:"CarpoolJourneyIssue"
                };
            
                jpushUtil.jpush(jpushArg);
            
            callback(null,"");
        }], function(err, data) {
                console.log("broadcast carpool info over");
        });
    }, 1000 * 60 * 5);
}

exports.Runner = run;

                                

	

