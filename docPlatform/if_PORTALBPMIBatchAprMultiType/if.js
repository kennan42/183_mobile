var MEAP=require("meap");
var path = require("path");
/**
 * 批量审批--多类型表单
 * 同一次请求允许多种类型表单进行批审
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
	    /*wsdl:"http://cpd.cttq.com:50000/PORTAL_BPMI_BatchAprMultiType/PORTALBPMIBatchAprMultiTypeImplBean?wsdl",*/
        wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"PORTALBPMIBatchAprMultiTypeImplBean.xml"),
        func:"PORTAL_BPMI_BatchAprMultiType.PORTAL_BPMI_BatchAprMultiType_Port.PORTALBPMIBatchAprMultiType",
        Params:arg,
        agent:false
	};
	
	MEAP.SOAP.Runner(option,function(err,res,data){
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
