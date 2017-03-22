var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ChatSchema = require("../ChatSchema.js");

function run(Param, Robot, Request, Response, IF) {
    var db = mongoose.createConnection(global.mongodbURL);
    var ContactModel = db.model("chat_contact", ChatSchema.ContactSchema);
    Response.setHeader("Content-type", "text/json;charset=utf-8");
    ContactModel.find({},{"userId":1,"userName":1,"portraitUrl":1,"_id":0}).sort({
        userName : 1
    }).exec(function(err, data) {
        db.close();
        if (!err) {
            Response.end(JSON.stringify({
                status : "0",
                data : data,
                msg : "查询成功"
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

