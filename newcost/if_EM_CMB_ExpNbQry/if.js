var MEAP=require("meap");
var path = require("path");
/**
 * 费用汇总条数查询
 * zrx2016.7.25
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 * 
 */
function run(Param,Robot,Request,Response,IF)
{
    var arg = JSON.parse(Param.body.toString());
    var option={
        //wsdl:http://bmq.cttq.com:51600/EM_CMB_ExpNbQry_Service/EMCMBExpNbQryImplBean?wsdl
        wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"EMCMBExpNbQryImplBean.xml"),
        func:"EM_CMB_ExpNbQry_Service.EM_CMB_ExpNbQry_Port.EMCMBExpNbQry",
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
