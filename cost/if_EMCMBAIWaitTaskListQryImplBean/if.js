var MEAP = require("meap");
var path = require("path");

/**
 * 统一待办-待办抬头
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
        //wsdl: "http://bmq.cttq.com:51600/EM_CMB_AIWaitTaskListQry/EMCMBAIWaitTaskListQryImplBean?wsdl",
        wsdl:"http://bmq.cttq.com:51600/EM_CMB_AIWaitTaskListQry/EMCMBAIWaitTaskListQryImplBean?wsdl",
        //wsdl: path.join(__dirname.replace(IF.name, ""), global.wsdl2, "EMCMBAIWaitTaskListQryImplBean.xml"),
        func: "EM_CMB_AIWaitTaskListQry.EM_CMB_AIWaitTaskListQry_Port.EMCMBAIWaitTaskListQry",
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
