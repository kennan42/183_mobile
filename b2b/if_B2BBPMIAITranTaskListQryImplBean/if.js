var MEAP = require("meap");
var path = require("path");

/**
 * 已办列表
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
        //wsdl: "http://b2d.cttq.com:50000/B2B_BPMI_AITranTaskListQry/B2BBPMIAITranTaskListQryImplBean?wsdl",
        wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"B2BBPMIAITranTaskListQryImplBean.xml"),
        func: "B2B_BPMI_AITranTaskListQry.B2B_BPMI_AITranTaskListQrySOAP.B2BBPMIAITranTaskListQry",
        Params:arg,
        agent:false
    };

    MEAP.SOAP.Runner(option, function (err, res, data) {
        Response.setHeader("Content-type","text/json;charset=utf-8");
        if (!err) {
            Response.end(JSON.stringify(data));
        }
        else {
            Response.end(JSON.stringify({status: '-1', message: 'Error'}));
        }
    });
}

exports.Runner = run;
