var MEAP=require("meap");
var path =require("path");

/**
 * 提交报销单（运营费用）
 * zrx
 * 2016-10-31
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
        //wsdl:http://bmq.cttq.com:51600/EM_GPBUS2_OpexSub/EMGPBUS2OpexSubImplBean?wsdl,
        wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"EMGPBUS2OpexSubImplBean.xml"),
        func:"EM_GPBUS2_OpexSub.EM_GPBUS2_OpexSub_Port.EMGPBUS2_OpexSub",
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
