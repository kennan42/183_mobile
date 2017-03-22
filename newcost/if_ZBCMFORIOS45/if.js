var MEAP=require("meap");
var path=require("path");

/**
 * 获取二级经费对象
 * zrx
 * 2016-11-1
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
        //wsdl:http://cttqdev.cttq.com:8000/sap/bc/srt/wsdl/flv_10002A111AD1/bndg_url/sap/bc/srt/rfc/sap/zbcmwsforios45/900/zbcmwsforios45/zbcmwsforios45?sap-client=900,
        wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"zbcmwsforios45.xml"),
        func:"ZBCMWSFORIOS45.ZBCMWSFORIOS45.ZBCMFORIOS45",
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
