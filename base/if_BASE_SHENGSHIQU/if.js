var MEAP = require("meap");
var path = require("path");
var async = require("async");
function run(Param, Robot, Request, Response, IF) {

    var arg = JSON.parse(Param.body.toString());
    var option = {
        wsdl : path.join(__dirname.replace(IF.name, ""), global.wsdl, "BASE_SHENGSHIQU.xml"),
        func : "ZHRWS2214.ZHRWS2214_soap12.ZHRWS2214",
        Params : arg,
        BasicAuth : global.TXSOAPAuth,
        agent : false
    };

    MEAP.SOAP.Runner(option, function(err, res, data) {
        if (!err) {
            Response.setHeader("Content-type", "text/json;charset=utf-8");
            var exp = new Date(new Date().valueOf() + 1000 * 60 * 1000)
            Response.end(JSON.stringify(data));
        } else {
            Response.end(JSON.stringify({
                status : '-1',
                message : 'Error'
            }));
        }
    });

}

exports.Runner = run;

