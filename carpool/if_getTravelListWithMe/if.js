var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");

/**
 * 查询同路人---查询拼车或约车 
 * @author xialin
 * @version 2015年12月26日09:19
   状态：已完成     接口废除！
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("get travel list with me---> ", Param.body.toString());
    var arg = JSON.parse(Param.body.toString());
    var startCityCode = arg.startCityCode;
    var arriveCityCode = arg.arriveCityCode;
    var startDate = arg.startDate;
    var endDate = arg.endDate;
    var currentTimes = new Date().getTime();

    var query = {
        state : 0,
        userType :{$in:[1,3]}
    };
    if (startDate != '' && endDate == '') {
        startDate = parseInt(startDate);
        if(startDate < currentTimes){
           startDate =  currentTimes;
        }
        query.startDate = {
            $gte : startDate
        };
    }else if (startDate == '' && endDate != '') {
        endDate = parseInt(endDate);
        query.startDate = {$lte:endDate};
    }else if (startDate != '' && endDate != '') {
          startDate = parseInt(startDate);
        if(startDate < currentTimes){
           startDate =  currentTimes;
        }
          endDate = parseInt(endDate);
          query.startDate = {$gte:startDate,$lte:endDate};
    }
     if (startCityCode != '') {
        query.startCityCode = startCityCode;
    }
    if (arriveCityCode != '') {
        query.arriveCityCode = arriveCityCode;
    }
    console.log("query--->", query);
    var db = mongoose.createConnection(global.mongodbURL);
    var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
    var carModel = db.model("carpoolCar", sm.CarpoolCarSchema);
    travelModel.find(query).populate("car").sort({startDate:1}).exec(function(err, data) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        db.close();
        if (!err) {
            Response.end(JSON.stringify({
                status : "0",
                msg : "查询成功",
                data : data
            }));
        } else {
            Response.end(JSON.stringify({
                status : "-1",
                msg : "查询失败"
            }));
        }
    });
}

exports.Runner = run;

