var MEAP=require("meap");
var path = require("path");
/**
 * 出差审批
 * zrx 2016.7.26
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
        //wsdl:http://bmq.cttq.com:51600/EM_GRPEXP_TRVLAPR/EMGRPEXPTRVLAPRImplBean?wsdl
        wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"EMGRPEXPTRVLAPRImplBean.xml"),
        func:"EM_GRPEXP_TRVLAPR.EM_GRPEXP_TRVLAPR_Port.EMGRPEXPTRVLAPR",
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
