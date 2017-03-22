var MEAP = require("meap");
var path=require("path");

function run(Param, Robot, Request, Response, IF)
{
    Robot.Log(Param.cmd);
    var option = {
        Request:Request,
        Response:Response,
        pathname:path.normalize(__dirname.replace(IF.name,"")+Param.cmd)
    };
    
    MEAP.SFS.Runner(option,null,null);
}

exports.Runner = run;