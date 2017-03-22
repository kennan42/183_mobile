var MEAP = require("meap");

function run(Param, Robot, Request, Response, IF) {
    try {
        Robot.destroySession(Request, Response);
        var cookies = [];
        cookies.push("x-mas-app-info=null; path=/");
        Response.setHeader("Set-Cookie", cookies);
       // Response.setHeader("Content-Type", "application/json;charset=utf8");
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        Response.end(JSON.stringify({
            status : '1',
            message : '成功',
            data : ''
        }));
    } catch (e) {
        //Response.setHeader("Content-Type", "application/json;charset=utf8");
         Response.setHeader("Content-type", "text/json;charset=utf-8");
        Response.end(JSON.stringify({
            status : '-1',
            message : e.message
        }));
    }

}

exports.Runner = run;

