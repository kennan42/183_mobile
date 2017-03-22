var MEAP=require("meap");
var path = require("path");
/**
 * 费用报销2期主数据同步(新)此接口是原主数据同步接口的简化，不提供费用报销不使用的数据
 * zrx,2016.7.25
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
        wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"zbcmbcodewsforai14.xml"),
        func:"ZBCMBCODEWSFORAI14.ZBCMBCODEWSFORAI14.ZBCMBCODEFORAI14",
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
