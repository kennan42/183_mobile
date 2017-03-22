var MEAP = require("meap");
var fs = require("fs");
var path = require("path");

function run(Param, Robot, Request, Response, IF) {
    var filepath = Param.files.file.path;
    var filename = Param.files.file.name;
    var filesize = Param.files.file.size;
    var data = fs.readFileSync(filepath);
    var doc = data.toString("base64");
    //var arg = JSON.parse(Param.body.toString());
    var option = {
        //wsdl:"http://cttqdev.cttq.com:8000/sap/bc/srt/wsdl/flv_10002A111AD1/bndg_url/sap/bc/srt/rfc/sap/zhrws2112/900/zhrws2112/zhrws2112?sap-client=900",
        wsdl : path.join(__dirname.replace(IF.name, ""), global.wsdl2, "zhrws2112.xml"),
        func : "ZHRWS2112.ZHRWS2112.ZHRWS2112",
        Params : {
            DOCUMENT : "",
            DOCUMENT2 : doc,
            DOC_SIZE : filesize,
            DOU_NAME : filename
        },
        BasicAuth : global.TXSOAPAuth,
        agent : false
    };

    MEAP.SOAP.Runner(option, function(err, res, data) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err) {
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
