var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");

/**
 * 获取乘客列表
 * @author wangdonghua
 * @version 2014年12月26日14:17
 * */
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var db = mongoose.createConnection(global.mongodbURL);
    var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
    var evaluateModel = db.model("carpoolEvaluate", sm.CarpoolEvaluateSchema);
    travelModel.find({
        travel : arg.travelId,
        state : 0
    }).exec(function(err, data) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err) {
            evaluateModel.find({
                travel : arg.travelId,
                evaluaterType : 1
            }, {
                userId2 : 1,
                _id : 0
            }).exec(function(err, data1) {
                db.close();
                if (!err) {
                    Response.end(JSON.stringify({
                        status : "0",
                        msg : "查询成功",
                        data : data,
                        supportedUsers:data1
                    }));
                } else {
                    Response.end(JSON.stringify({
                        status : "-1",
                        msg : "查询失败"
                    }));
                }
            });

        } else {
            db.close();
            Response.end(JSON.stringify({
                status : "-1",
                msg : "查询失败"
            }));
        }
    });
    ;

}

exports.Runner = run;

