var MEAP=require("meap");
var util = require("../../base/util.js");

function run(Param, Robot, Request, Response, IF)
{
    Response.setHeader("Content-Type","application/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
    util.pushMsg(arg);
    Response.end(JSON.stringify({
        "status":"0",
        "msg":"pushOver"
    }));
}

exports.Runner = run;


                                

	

