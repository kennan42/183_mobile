var MEAP=require("meap");
var path = require("path");

/**
 * 功能：给B2C提供的的项目查询接口
 * 作者:xialin
 * 时间:2015-12-22
 */

function run(Param, Robot, Request, Response, IF)
{
    var arg = JSON.parse(Param.body.toString());
    console.log("in EM_PROJ_ProjApplQry**********");
    
    var option = {
        
    
      wsdl:"http://bmd.cttq.com:51200/EM_PROJ_ProjForB2CQry/EMPROJProjForB2CQryImplBean?wsdl",
     
        func: "EM_PROJ_ProjForB2CQry.EM_PROJ_ProjForB2CQry_Port.EMPROJProjForB2CQry",
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

