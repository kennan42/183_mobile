var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");

/**
 * 获取免责声明
 * @author wangdonghua
 * @version 2014年12月27日14:57
 * */

function run(Param, Robot, Request, Response, IF) {
    var db = mongoose.createConnection(global.mongodbURL);
    var declareModel = db.model("carpoolDeclare", sm.CarpoolDeclareSchema);
    declareModel.findOne(function(err, doc) {
        db.close();
        Response.setHeader("Content-type", "text/json;charset=utf-8");
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

