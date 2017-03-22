var MEAP=require("meap");
var path = require("path");

/**
 * 附件删除
 * zrx
 * 2016-10-26
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param,Robot,Request,Response,IF)
{
    var arg = JSON.parse(Param.body.toString());
    var option={
       // wsdl:"http://bmq.cttq.com:51600/BCM_CMF_BCMCMFAnnexDlt_Service_Service/BCMCMFBCMCMFAnnexDltServiceImplBean?wsdl"
        wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"BCMCMFBCMCMFAnnexDltServiceImplBean.xml"),
        func:"BCM_CMF_BCMCMFAnnexDlt_Service_Service.BCM_CMF_BCMCMFAnnexDlt_Service_Port.BCMCMFAnnexDlt",
        Params:arg,
        agent:false
    };
    
    MEAP.SOAP.Runner(option,function(err,res,data){
        Response.setHeader("Content-type","text/json;charset=utf-8");
        if(!err)
        {
            Response.end(JSON.stringify(data));
        }
        else
        {
            Response.end(JSON.stringify({status:'-1',message:'Error'}));
        }
    });
}

exports.Runner = run;
