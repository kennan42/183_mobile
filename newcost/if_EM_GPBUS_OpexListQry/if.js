var MEAP=require("meap");
var path = require("path");

/**
 * 查询未提交运营费用
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
        //wsdl:http://bmq.cttq.com:51600/EM_GPBUS_OpexListQry/EMGPBUSOpexListQryImplBean?wsdl,
        wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"EMGPBUSOpexListQryImplBean.xml"),
        func:"EM_GPBUS_OpexListQry.EM_GPBUS_OpexListQry_Port.EM_GPBUS_OpexListQry",
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
