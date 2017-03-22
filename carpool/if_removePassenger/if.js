var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");

/**
 * 拼车-司机删除乘客
 * @author xialin
 * @version 2016年4月6日
   状态：完成
   
   入参： arg.userId
          arg.userName
		  arg.company 
          arg.travelId  
          arg.rejectedUserId 
		  arg.rejectedUserName
		  arg.reason
		  
		  
   
   
 * */
var db = null;
var arg = null;
function run(Param, Robot, Request, Response, IF)
{
	 arg = JSON.parse(Param.body.toString());
	 db = mongoose.createConnection(global.mongodbURL);
     main(arg,Response);
}

function main(arg,Response){
    async.series([updateSeatCount,updatePassengerTravel,addRemovePassengerDocument],
    function(err,data){
        db.close();
        if(!err){
            Response.end(JSON.stringify({
                status : "0",
				msgStatus:"S4000108",
                msg : "移除乘客成功"
            }));
        }else{
            Response.end(JSON.stringify({
                status : "0",
				msgStatus:"E4000116",
                msg : "移除乘客失败"
            }));
        }
    });
}

//更新行程剩余座位数
function updateSeatCount(callback){
    var travelId = arg.travelId;
    var travelModel = db.model("carpoolTravel",sm.CarpoolTralvelSchema);
    travelModel.update({_id:travelId},{$inc:{bookedSeatCount:-1}},function(err,data){
        callback(err,data);
    });
}

//更新乘客行程状态
function updatePassengerTravel(callback){
    var travelId = arg.travelId;
    var userId = arg.rejectedUserId;  //乘客ID
	
	var company =arg.company;  //公司编码
    var travelModel = db.model("carpoolTravel",sm.CarpoolTralvelSchema);
    travelModel.update({travel:travelId,userId:userId,company:company},{state:2},function(err,data){
        callback(err,data);
    });
}

//添加踢人记录
function addRemovePassengerDocument(callback){
    var userId = arg.userId;
    var userName = arg.userName;
    var rejectedUserId = arg.rejectedUserId;
    var rejectedUserName = arg.rejectedUserName;
	var company =arg.company;  //公司编码
    var travelId = arg.travelId;
    var reason = arg.reason;
    
    var rejectModel = db.model("carpoolReject",sm.CarpoolRejectSchema);
    var rejectEntity = new rejectModel({
        userId:userId,
        userName:userName,
        rejectedUserId:rejectedUserId,
        rejectedUserName:rejectedUserName,
        travle:travelId,
		company:company,
        reason:reason
    });
    rejectEntity.save(function(err,data){
        callback(err,data);
    });
}

exports.Runner = run;


                                

	

