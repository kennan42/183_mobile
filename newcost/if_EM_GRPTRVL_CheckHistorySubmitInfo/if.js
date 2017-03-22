var MEAP=require("meap");
var path = require("path");
/**
 * 查询已报销日期的历史报销单
 * zrx 2016.8.18
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
        wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"EMGRPTRVLCheckHistorySubmitInfoImplBean.xml"),
        func:"EM_GRPTRVL_CheckHistorySubmitInfo.EM_GRPTRVL_CheckHistorySubmitInfo_Port.EMGRPTRVL_CheckHistorySubmitInfo",
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
