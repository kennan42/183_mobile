var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");

/**
 * 获取行程数量
 * @author xialin
 * @version 2016-01-19
   状态：完成
 * */
var arg = null;
var db = null;
function run(Param, Robot, Request, Response, IF)
{
    arg = JSON.parse(Param.body.toString());
    db = mongoose.createConnection(global.mongodbURL);
	main(Response);

}

function main(Response){
    async.parallel([getTravelCountAsDriver,getTravelCountAsPassenger,getTravelOrderCount],function(err,data){
        db.close();
        Response.setHeader("Content-type","text/json;charset=utf-8");
        if(!err){
            Response.end(JSON.stringify({
                status:"0",
                msg:"查询成功",
                count1:data[0],
                count2:data[1],
				count3:data[2]
            }));
        }else{
            Response.end(JSON.stringify({
                status:"-1",
                msg:"查询失败"
            }));
        }
    });
}

//获取作为司机的行程数量
function getTravelCountAsDriver(callback){
    var travelModel = db.model("carpoolTravel",sm.CarpoolTralvelSchema);
    travelModel.count({userId:arg.userId,userType:1,carpoolType:1,state:0},
        function(err,count){
            callback(err,count);
    });
}

//获取作为乘客的行程数量
function getTravelCountAsPassenger(callback){
    var travelModel = db.model("carpoolTravel",sm.CarpoolTralvelSchema);
    travelModel.count({userId:arg.userId,userType:2,carpoolType:1,state:0},
        function(err,count){
             callback(err,count);
    });
}


//获取约车行程数量
function getTravelOrderCount(callback){
    var travelModel = db.model("carpoolTravel",sm.CarpoolTralvelSchema);
    travelModel.count({userId:arg.userId,carpoolType:2,state:0},
        function(err,count){
             callback(err,count);
    });
}



exports.Runner = run;


                                

	

