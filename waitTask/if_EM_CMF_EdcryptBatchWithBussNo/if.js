var MEAP=require("meap");
var path = require("path");
/**
 * 待办费用报销CE解密事由接口
 * xialin
 * 20161124
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
        wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl2,"EMCMFEdcryptBatchWithBussNoImplBean.xml"),
        func:"EM_CMF_EdcryptBatchWithBussNo.EM_CMF_EdcryptBatchWithBussNo_Port.EMCMF_EdcryptBatchWithBussNo",
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
