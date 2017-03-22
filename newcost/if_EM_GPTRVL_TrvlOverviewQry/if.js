var MEAP=require("meap");
var path = require("path");
/**
 * 统一待办-查询出差信息
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
        wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"EMGPTRVLTrvlOverviewQryImplBean.xml"),
        func:"EM_GPTRVL_TrvlOverviewQry.EM_GPTRVL_TrvlOverviewQry_Port.EMGPTRVLTrvlOverviewQry",
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
