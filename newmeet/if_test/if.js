var MEAP = require("meap");
var mongoose = require("mongoose");
var sm = require("../meetSchema.js");

function run(Param, Robot, Request, Response, IF) {
    var db = mongoose.createConnection(global.mongodbURL);
    var meetRoomDetailUseCountModel = db.model("meetRoomDetailUseCount", sm.MeetRoomDetailUseCountSchema);
    meetRoomDetailUseCountModel.update({
        "invokeType" : "333"
    }, {
        "$inc" : {
            "count" : 1
        }
    }, {
        upsert:true
    },
    function(err) {
        db.close();
        if (!err) {
            Response.end("success");
        } else {
            console.log("meetRoomDetailUseCount--->",err);
            Response.end("fail");
        }
    });
}

exports.Runner = run;

