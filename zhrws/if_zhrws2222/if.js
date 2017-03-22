var MEAP = require("meap");
var path = require("path");

/**
 * 加班、考勤异常待办/已办总条数
 *
 * @param Param
 * @param Robot
 * @param Request
 * @param Response
 * @param IF
 */
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    // P_BEGDA 与 P_ENDDA 的格式为 yyMMdd
    var option = {
        // wsdl:"http://cttqdev.cttq.com:8000/sap/bc/srt/wsdl/flv_10002A111AD1/srvc_url/sap/bc/srt/rfc/sap/zhrws2222/800/zhrws2222/zhrws2222?sap-client=800",
       // http://cttqdev.cttq.com:8000/sap/bc/srt/wsdl/flv_10002A111AD1/bndg_url/sap/bc/srt/rfc/sap/zhrws2222/900/zhrws2222/zhrws2222?sap-client=900
       //http://cttqdev.cttq.com:8000/sap/bc/srt/wsdl/flv_10002A111AD1/bndg_url/sap/bc/srt/rfc/sap/zhrws2222/900/zhrws2222/zhrws2222?sap-client=900
        wsdl: path.join(__dirname.replace(IF.name, ""), global.wsdl2, "zhrws2222.xml"),
        func: "ZHRWS2222.ZHRWS2222.ZHRWS2222",
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
