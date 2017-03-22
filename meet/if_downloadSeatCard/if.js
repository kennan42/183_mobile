var MEAP = require("meap");
var path = require("path");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");

function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var meetBookId = arg.meetBookId;
    var db = mongoose.createConnection(global.mongodbURL);
    var MeetBookModel = db.model("meetBook", sm.MeetBookSchema);
    Response.setHeader("Content-type","text/json;charset=utf-8");
    MeetBookModel.findById(meetBookId, function(err, data) {
        db.close();
        if (!err && data.seatCard != "") {
            Response.end(JSON.stringify({
                status:"0",
                msg:"请下载文件",
                fileURL:data.seatCard
            }));
        } else {
            Response.end(JSON.stringify({
                status : "-1",
                msg : "下载席位卡失败"
            }));
        }
    });
}

exports.Runner = run;

