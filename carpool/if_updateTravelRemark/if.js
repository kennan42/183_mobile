var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");

/**
 * 修改行程备注信息
 * @author wangdonghua
 * @version 2014年12月26日16:24
 * */
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var db = mongoose.createConnection(global.mongodbURL);
    var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
    travelModel.findById(arg.travelId, function(err, doc) {
        if (!err) {
            doc.remark = arg.remark;
            doc.updateTime = new Date().getTime();
            doc.save(function(err, doc) {
                Response.setHeader("Content-type","text/json;charset=utf-8");
                db.close();
                if (!err) {
                    Response.end(JSON.stringify({
                        status : "0",
                        msg : "修改成功"
                    }));
                } else {
                    Response.end(JSON.stringify({
                        status : "-1",
                        msg : "修改失败"
                    }));
                }
            });
        } else {
            Response.end(JSON.stringify({
                status : "-1",
                msg : "查询行程信息失败"
            }));
        }
    });
}

exports.Runner = run;

