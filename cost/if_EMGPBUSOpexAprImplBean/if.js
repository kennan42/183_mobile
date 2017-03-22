var MEAP = require("meap");
var path = require("path");

/**
 * 运营费用审批
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
        //wsdl: "http://bmd.cttq.com:51200/EM_GPBUS_OpexApr/EMGPBUSOpexAprImplBean?wsdl",
        wsdl: path.join(__dirname.replace(IF.name, ""), global.wsdl2, "EMGPBUSOpexAprImplBean.xml"),
        func: "EM_GPBUS_OpexApr.EM_GPBUS_OpexApr_Port.EMGPBUSOpexApr",
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
