var MEAP = require("meap");
var path = require("path");

/**
 * 统一待办-查询出差信息
 *
 * @param Param
 * @param Robot
 * @param Request
 * @param Response
 * @param IF
 *
 * @author cky
 */
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var option = {
        //wsdl: "http://bmd.cttq.com:51200/EM_GPTRVL_TrvlOverviewQry/EMGPTRVLTrvlOverviewQryImplBean?wsdl",
        wsdl: path.join(__dirname.replace(IF.name, ""), global.wsdl2, "EMGPTRVLTrvlOverviewQryImplBean.xml"),
        func: "EM_GPTRVL_TrvlOverviewQry.EM_GPTRVL_TrvlOverviewQry_Port.EMGPTRVLTrvlOverviewQry",
        Params: arg,
        agent: false
    };

    MEAP.SOAP.Runner(option, function (err, res, data) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err) {
            Response.end(JSON.stringify(data));
        } else {
            Response.end(JSON.stringify({
                status: '-1',
                message: 'Error'
            }));
        }
    });
}

exports.Runner = run;
