var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");

/**
 * 查询行程详情： 获取拼车、不确定行程、约车三种通用， 注意乘客信息返回要标注类型  （发起人）
 * @author xialin
 * @version 2016年4月11
 状态：已完成
 * */

function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var travelId = arg.travelId;
    
	var carpoolType =arg.carpoolType;  //判定拼车还是约车
	
	
    var db = mongoose.createConnection(global.mongodbURL);
    var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
    var carModel = db.model("carpoolCar", sm.CarpoolCarSchema);
    travelModel.find({
        _id : travelId
    }).populate("car").exec(function(err, doc) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err && doc != null && doc.length > 0) {
            //根据流水号查询出乘客
            var serialNumber = doc[0].travelSerialNumber;
            travelModel.find({
                travelSerialNumber : serialNumber,
                userType : {$in:[2,3,4]},
				carpoolType:carpoolType,
                state : 0
            }, {
                userId : 1,
                userName : 1,
				company:1,
				userType:1
              
            }).exec(function(err, passengers) {
                db.close();
                Response.end(JSON.stringify({
                    status : "0",
                    msg : "查询成功",
					msgStatus:"S4000103",
                    data : doc[0],
                    passengers : passengers
                }));
            });

        } else {
            db.close();
            Response.end(JSON.stringify({
                status : "-1",
				msgStatus:"E4000103",
                msg : "查询失败"
            }));
        }
    });

}

exports.Runner = run;

