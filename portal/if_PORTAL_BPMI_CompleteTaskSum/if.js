var MEAP=require("meap");
var path = require("path");

function run(Param,Robot,Request,Response,IF)
{
	var arg = JSON.parse(Param.body.toString());
	var option={
		//wsdl:"http://10.10.1.185:50000/PORTAL_BPMI_CompleteTaskList/PORTALBPMICompleteTaskListImplBean?wsdl",
		wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"PORTAL_BPMI_CompleteTaskSum.xml"),
		func:"PORTAL_BPMI_CompleteTaskList.PORTAL_BPMI_CompleteTaskList_Port.PORTALBPMICompleteTaskList",
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
