var MEAP = require("meap");
var path = require("path");

/**
 * 修改手机号
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
        //wsdl: "http://cttqdev.cttq.com:8000/sap/bc/srt/wsdl/flv_10002A111AD1/bndg_url/sap/bc/srt/rfc/sap/zhrtxws12/800/zhrtxws12/zhrtxws12?sap-client=800",
        wsdl: path.join(__dirname.replace(IF.name, ""), global.wsdl, "zhrtxws12.xml"),
        func: "ZHRTXWS12.ZHRTXWS12.ZHRTXWS12",
        Params: arg,
        BasicAuth: global.TXSOAPAuth,
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
