var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");

function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var db = mongoose.createConnection(global.mongodbURL);
    var meetBookModel = db.model("meetBook", sm.MeetBookSchema);
    Response.setHeader("Content-type","text/json;charset=utf-8");
    meetBookModel.update({_id:arg.meetBookId},{state:4},function(err){
        db.close();
        if(!err){
            Response.end(JSON.stringify({
                status:"0",
                msg:"取消成功"
            }));
        }else{
            Response.end(JSON.stringify({
                status:"-1",
                msg:"取消失败"
            }));
        }
    });
}

exports.Runner = run;

