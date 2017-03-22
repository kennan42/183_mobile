var MEAP = require("meap");
var path = require("path");
var fs = require('fs');
var gm = require("gm");
var imageMagick = gm.subClass({
    imageMagick: true
});

function run(Param, Robot, Request, Response, IF){
    var userid = Param.params.P_PERNR;
    var arg = {
        "IT_EXTENDMAP": {
            "item": [{
                "FIELDNAME": '',
                "VALUE": ''
            }]
        },
        "I_PUBLIC": {
            "CHANNELSERIALNO": '',
            "ORIGINATETELLERID": '',
            "ZDOMAIN": '100',
            "I_PAGENO": '',
            "I_PAGESIZE": '',
            "ZVERSION": ''
        },
        "P_PERNR": userid
    };
    var option = {
        //wsdl:global.TX_DOMAIN_URL_PRE + "/sap/bc/srt/wsdl/srvc_5288FD40166B0A50E1008000C0A80114/wsdl11/allinone/ws_policy/document?sap-client=800",
        wsdl: path.join(__dirname.replace(IF.name, ""), global.wsdl, "ZHRMMS_READ_PHOTO.xml"),
        func: "ZHRWSMSS05.ZHRWSMSS05_soap12.ZHRWSMSS05",
        Params: arg,
        BasicAuth: global.TXSOAPAuth,
        agent:false
    };
    
    MEAP.SOAP.Runner(option, function(err, res, data){
        //Response.setHeader("Content-type","text/json;charset=utf-8");
        if (!err) {
            var d = new Buffer(data.B64DATA, "base64");
            var originalImg = "/tmp/original_xxxxx.jpg";
            var compressedImg = "/tmp/compressed_xxxxx.jpg";
            //fs.unlinkSync(originalImg);
            //fs.unlinkSync(compressedImg);
            fs.writeFileSync(originalImg, d);
            var imgBuffer = imageMagick(originalImg);
            imgBuffer.resize(96, 128, "!");
            imgBuffer.write(compressedImg, function(err){
                var option = {
                    Request: Request,
                    Response: Response,
                    pathname: compressedImg
                };
                MEAP.SFS.Runner(option, null, Robot);
            });
        }
        else {
            Response.end(JSON.stringify({
                status: '-1',
                message: 'Error'
            }));
        }
    });
}

exports.Runner = run;
