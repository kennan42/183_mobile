var MEAP=require("meap");
var path = require("path");
/**
 * 重新生成未提交数据
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param, Robot, Request, Response, IF)
{
    var arg = JSON.parse(Param.body.toString());
    var option={
        //wsdl:"http://bmq.cttq.com:51600/EM_GRPEXP_RESUBMIT/EMGRPEXPRESUBMITImplBean?wsdl",
        wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"EMGRPEXPReSubmitImplBean.xml"),
        func:"EM_GRPEXP_ReSubmit.EM_GRPEXP_ReSubmit_Port.EM_GRPEXP_ReSubmit",
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


                                

	

