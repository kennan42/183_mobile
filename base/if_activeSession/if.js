var MEAP = require("meap");
var REDIS = require("meap_redis");

function run(Param, Robot, Request, Response, IF) {
    var cookies = Response.getHeader("Set-Cookie") || [];
    cookies.push("x-mas-app-info=" + Param.appid + "/" +  Param.sid + "; path=/");
    Response.setHeader("Set-Cookie", cookies);
    Response.end(JSON.stringify({
        status:"200",
        message:"success"
    }));
}

exports.Runner = run;

