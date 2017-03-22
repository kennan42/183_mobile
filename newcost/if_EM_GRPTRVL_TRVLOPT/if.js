var MEAP=require("meap");
var path = require("path");
/**
 * 出差行程操作（新增、修改、删除）
 * zrx2016.7.25
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
        wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"EMGRPTRVLTRVLOPTImplBean.xml"),
        func:"EM_GRPTRVL_TRVLOPT.EM_GRPTRVL_TRVLOPTSOAP.TrvlOpt",
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
