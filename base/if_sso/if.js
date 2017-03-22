var MEAP = require("meap");

function run(Param, Robot, Request, Response, IF){
    {
		var uuid = Robot.createSession(Response, true, 30 * 60);
        Response.setHeader("Set-Cookie", ["x-mas-app-info=" + Param.appid + "/" + uuid + "; path=/"])
        Response.setHeader("Location", "/web/login.html");
        Response.statusCode = 302;
        Response.end();
    }   
}

exports.Runner = run;



