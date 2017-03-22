var MEAP=require("meap");
var path = require("path");
function run(Param, Robot, Request, Response, IF)
{     
    var arg = JSON.parse(Param.body.toString());
      var option = {
        wsdl : path.join(__dirname.replace(IF.name, ""), global.wsdl, "zhrws_uncommon.xml"),
        func : "ZHRWS_UNCOMMON.ZHRWS_UNCOMMON.ZHRWS_UNCOMMON",
        Params : arg,
		BasicAuth:global.TXSOAPAuth,
        agent:false
    };

    MEAP.SOAP.Runner(option, function(err, res, data) {
        Response.setHeader("Content-Type", "text/json;charset=utf-8");
        if (!err) {
            Response.end(JSON.stringify({
                "status":"0",
                "data":data
            }));
        } else {
            console.log("getSilingInfo err--->", err);
            Response.end(JSON.stringify({
                status : '-1',
                message : 'Error'
            }));
        }
    });
}

exports.Runner = run;