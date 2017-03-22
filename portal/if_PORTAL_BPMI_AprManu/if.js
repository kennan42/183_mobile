var MEAP=require("meap");
var path = require("path");

function run(Param,Robot,Request,Response,IF)
{
	var arg = JSON.parse(Param.body.toString());
	var option={
		//wsdl:global.TX_IP_URL_PRE + "/PORTAL_BPMI_AprManu/PORTALBPMIAprManuImplBean?wsdl",
		wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"PORTAL_BPMI_AprManu.xml"),
		func:"PORTAL_BPMI_AprManu.PORTAL_BPMI_AprManu_Port.PORTALBPMIAprManu",
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
