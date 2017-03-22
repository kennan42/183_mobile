var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");
var util = require("../../base/util.js");
var jpushUtil = require("../../jpush2/jpush_util.js");


/**
 * 
 * 功能：发布约车信息(司机) 1.发布满人 2.发布未满人
 * 作者：xialin
 * 时间：2015-12-28 11：20
   状态：完成
   入参：    arg.setUserNumber  ：设定多少人开车
	         arg.addedUser  添加乘客   
	         arg.userId   接口用户
			 arg.userName 
			 
			 arg.startCityCode
			 arg.startCity
			 arg.startAddress
			 arg.arriveCityCode
			 arg.arriveCity
			 arg.arriveAddress
			 arg.startDate
			 arg.startProvince
			 arg.arriveProvince
			 arg.remark

			 arg.car   车
 */
var arg = null;
var travelObj = null;

var  ifTransPCar =2;  //是否转成拼车，默认2 约车     1：转成拼车



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
    var addedUser = arg.addedUser;
    var setUserNumber = parseInt(arg.setUserNumber); //设定到达多少人
	

   var remainingSearCount = parseInt(arg.remainingSearCount);//还可分享座位数
    var seatCount = remainingSearCount + addedUser.length;
    var seatState = 0;
    if (remainingSearCount == 0) {
        seatState = 1;
    }
    var ifstart  = setUserNumber -addedUser.length;
    
    var  travelModel =null;
    if (ifstart == 0) {
        
        //转成拼车
        ifTransPCar =1;

    }else{
        
		 ifTransPCar =2;
    }
      travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
 
    var travelEntity = new travelModel({
        car : arg.car,
        userId : arg.userId,
        userName : arg.userName,
        userType : 1,  //1:约车司机;2:约车乘客
        startCityCode : arg.startCityCode,
        startCity : arg.startCity,
        startAddress : arg.startAddress,
        arriveCityCode : arg.arriveCityCode,
        arriveCity : arg.arriveCity,
        arriveAddress : arg.arriveAddress,
        startDate : parseInt(arg.startDate),
        travelSerialNumber : serialNumber, //行程流水号
        twoDimensionalCode : "",   //二维码
        seatCount : seatCount,     //提供座位数
        bookedSeatCount : addedUser.length, //已经预定车位数
        seatState : seatState,   //0：未满 1已满
                                     
        setUserNumber:setUserNumber, //设定多少人发车
        carpoolType:ifTransPCar,  // 1 拼车  2.约车 
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
            //添加乘客搭车记录
            if (addedUser.length > 0) {
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
			if(ifTransPCar==2){
				pushMsgDelay(doc._id);
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
	 var addedUser =arg.addedUser;
    if (i < addedUser.length) {
		
		var base64TwoDimensionalCode="";
		if(ifTransPCar==1){
	    var originalTwoDimensionalCode = serialNumber + "," + arg.userId + "," + addedUser[i].userId;
        base64TwoDimensionalCode = "CTTQ01001" + new Buffer(originalTwoDimensionalCode).toString('base64');	
		}
		
      
        var travleEntity = new travelModel({
            travel : doc._id,
            car : arg.car,
            userId : addedUser[i].userId,
            userName : addedUser[i].userName,
            userType:2,  //乘客
			carpoolType :ifTransPCar,  //拼车
			setUserNumber:doc.setUserNumber,
			
            startCityCode : arg.startCityCode,
            startCity : arg.startCity,
            startAddress : arg.startAddress,
            arriveCityCode : arg.arriveCityCode,
            arriveCity : arg.arriveCity,
            arriveAddress : arg.arriveAddress,
            startDate : parseInt(arg.startDate),
            travelSerialNumber : serialNumber,
            twoDimensionalCode : base64TwoDimensionalCode,
			 seatState : doc.seatState,   //0：未满 1已满
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
                addPassenger(i, db, arg, serialNumber, Response, doc)
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
         var userIds = [];
		 for (var i in addedUser) {
            userIds.push(addedUser[i].userId);
        }
	     if(ifTransPCar==2){
			  //			  
			  var pushContent ="司机" + arg.userName + "将您添加到" + util.getMMddHHmmFromTimes(parseInt(arg.startDate)) 
                        + "从" + arg.startCity + "到" + arg.arriveCity + "的约车行程内，请您注意此行程状态~";
			  var 	subModule ="CarpoolOrder";	
		 }else{
		     //满了发送乘客
			  var pushContent ="您已被" + arg.userName + "添加到" + util.getMMddHHmmFromTimes(parseInt(arg.startDate)) 
                        + "从" + arg.startCity + "到" + arg.arriveCity + "的行程中啦，记得打包行囊准时出发哟。";
              var 	subModule ="CarpoolPassenger";	
		 }

        //司机AA将您添加到MM月DD日HH时mm分PP到pp的约车行程内，请您注意此行程状态~
        //您预约的MM月DD日HH时mm分PP到pp的约车行程已满足司机出发条件，请您准时到达集合地点哦~
     
        var jpushArg = {
            userid:arg.userId,
            userList:userIds,
            title:"",
            content:pushContent,
            type:0,
            msgType:"Carpool",
            subModule:subModule
        };
        
            jpushUtil.jpush(jpushArg);
        
    }
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

                                

	

