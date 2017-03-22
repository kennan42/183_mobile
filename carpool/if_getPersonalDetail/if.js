var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");

/**
 * 查询个人行程，信誉信息汇总
 * @author wangdonghua
 * @version 2014年12月27日16:12
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
    async.parallel([getTravelCountAsDriver,getTravelCountAsPassenger,getCredit],
        function(err,data){
            Response.setHeader("Access-Control-Allow-Origin","*");
            Response.setHeader("Content-type","text/json;charset=utf-8");
           db.close();
            if(!err){
                Response.end(JSON.stringify({
                    status:"0",
                    msg:"查询成功",
                    count1:data[0],
                    count2:data[1],
                    credit:data[2]
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
    travelModel.count({userId:arg.userId,userType:1},
        function(err,count){
            callback(err,count);
    });
}

//获取作为乘客的行程数量
function getTravelCountAsPassenger(callback){
    var travelModel = db.model("carpoolTravel",sm.CarpoolTralvelSchema);
    travelModel.count({userId:arg.userId,userType:2},
        function(err,count){
             callback(err,count);
    });
}

//查询个人信誉信息
function getCredit(callback){
    var creditModel = db.model("carpoolCredit",sm.CarpoolCreditSchema);
    creditModel.findOne({userId:arg.userId}).exec(function(err,data){
        callback(err,data);
    });
}

exports.Runner = run;


                                

	

