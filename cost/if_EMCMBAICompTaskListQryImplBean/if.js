var MEAP = require("meap");
var path = require("path");

/**
 * 统一待办-已办抬头
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
        wsdl: "http://bmq.cttq.com:51600/EM_CMB_AICompTaskListQry/EMCMBAICompTaskListQryImplBean?wsdl",
        //wsdl: path.join(__dirname.replace(IF.name, ""), global.wsdl2, "EMCMBAICompTaskListQryImplBean.xml"),
        func: "EM_CMB_AICompTaskListQry.EM_CMB_AICompTaskListQry_Port.EMCMBAICompTaskListQry",
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
