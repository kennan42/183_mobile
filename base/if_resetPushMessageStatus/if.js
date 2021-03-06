var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../BaseSchema.js");

function run(Param, Robot, Request, Response, IF) {
    Response.end(JSON.stringify({
        status : "0"
    }));
    return;
    var arg = JSON.parse(Param.body.toString());
    var db = mongoose.createConnection(global.mongodbURL);
    var pusuMessageLogModel = db.model("basePushMessageLog", sm.BasePushMessageLogSchema);
    pusuMessageLogModel.update({
        userId : arg.userId,
        appId : arg.appId
    }, {
        readStatus : 1
    }, {
        multi : true
    }, function(err) {
        db.close();
        if (!err) {
            Response.end(JSON.stringify({
                status : "0"
            }));
        } else {
            Response.end(JSON.stringify({
                status : "-1"
            }));
        }
    });
}

exports.Runner = run;

