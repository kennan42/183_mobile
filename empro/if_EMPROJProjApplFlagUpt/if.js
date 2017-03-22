var MEAP = require("meap");
var path = require("path");
/**
 * 功能：项目申请流程报销标识更新
 * 作者:xialin
 * 时间:2015-12-22
 */

function run(Param, Robot, Request, Response, IF)
{
    var arg = JSON.parse(Param.body.toString());
    console.log("in EM_PROJ_ProjApplQry**********");
    
    var option = {
        
    
      wsdl:"http://bmd.cttq.com:51200/EM_PROJ_ProjApplFlagUpt_Service/EMPROJProjApplFlagUptImplBean?wsdl",
     
        func: "EM_PROJ_ProjApplFlagUpt_Service.EM_PROJ_ProjApplFlagUpt_Port.EMPROJProjApplFlagUpt",
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
