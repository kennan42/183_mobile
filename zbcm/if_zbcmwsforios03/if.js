var MEAP = require("meap");
var path = require("path");

/**
 * IOS实时读取供应商信息
 *
 * @param Param
 * @param Robot
 * @param Request
 * @param Response
 * @param IF
 */
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var option = {
        //wsdl: "http://cttqdev.cttq.com:8000/sap/bc/srt/wsdl/flv_10002A111AD1/bndg_url/sap/bc/srt/rfc/sap/zbcmwsforios03/800/zbcmwsforios03/zbcmwsforios03?sap-client=800",
        wsdl: path.join(__dirname.replace(IF.name, ""), global.wsdl, "zbcmwsforios03.xml"),
        func: "ZBCMWSFORIOS03.ZBCMWSFORIOS03.ZBCMFORIOS03",
        Params: arg,
        agent: false
    };

    MEAP.SOAP.Runner(option, function (err, res, data) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err) {
            Response.end(JSON.stringify(data));
        }
        else {
            Response.end(JSON.stringify({status: '-1', message: 'Error'}));
        }
    });
}

exports.Runner = run;
