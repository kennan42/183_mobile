var MEAP = require("meap");
var path = require("path");

/**
 * 提交报销单（运营费用）
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
        //wsdl: "http://bmd.cttq.com:51200/EM_GPBUS_OpexSub/EMGPBUSOpexSubImplBean?wsdl",
        wsdl: path.join(__dirname.replace(IF.name, ""), global.wsdl2, "EMGPBUSOpexSubImplBean.xml"),
        func: "EM_GPBUS_OpexSub.EM_GPBUS_OpexSub_Port.EM_GPBUS_OpexSub",
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
