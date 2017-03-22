var MEAP = require("meap");
var mongoose = require("mongoose");
var meetSchema = require("../meetSchema.js");

/**
 * 根据会议室id范围查询被冻结的会议室列表
 * */
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var meetRoomIds = arg.meetRoomIds;
    var frozenBegin = parseInt(arg.frozenBegin);
    var frozenEnd = parseInt(arg.frozenEnd);
    var db = mongoose.createConnection(global.mongodbURL);
    var meeRoomModel = db.model("meetRoom", meetSchema.MeetRoomSchema);
    var query = meeRoomModel.find({
         "state" : 2,
        "_id" : {
            "$in" : meetRoomIds
        },
        "frozenBegin" : {
            "$lte" : frozenEnd
        },
        "frozenEnd" : {
            "$gte" : frozenBegin
        }
    });
    query.sort({
        "guishudiName" : 1,
        "name" : 1
    }).exec(function(err, data) {
        Response.setHeader("Content-type","text/json;charset=utf-8");
        db.close();
        if (!err) {
            Response.end(JSON.stringify({
                "status" : "0",
                "msg" : "",
                "data" : data
            }));
        } else {
            Response.end(JSON.stringify({
                "status" : "-1",
                "msg" : "查询失败"
            }));
        }
    });
}

exports.Runner = run;

