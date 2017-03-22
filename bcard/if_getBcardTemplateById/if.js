var MEAP = require("meap");
var mongoose = require("mongoose");
var bcardSchema = require("../bcardSchema.js");

function run(Param, Robot, Request, Response, IF) {
    console.log("bcard.getBcardTemplateById start");
    Response.setHeader("Content-Type", "text/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
    var templateId = arg.templateId;
    var conn = mongoose.createConnection(global.mongodbURL);
    var bcardTemplateModel = conn.model("bcard_template", bcardSchema.bcardTemplateSchema);
    bcardTemplateModel.findById(templateId, function(err, doc) {
        conn.close();
        Response.end(JSON.stringify({
            "status" : "0",
            "data" : doc
        }));
    });
}

exports.Runner = run;

