var MEAP=require("meap");
var path = require("path");

function run(Param,Robot,Request,Response,IF)
{
	var arg = JSON.parse(Param.body.toString());
	var option={
		//wsdl:global.TX_TRAVEL_URL_PRE  + "/EM_CMF_WaitTaskSumQry/EMCMFWaitTaskSumQryImplBean?wsdl",
		wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl2,"EMCMFWaitTaskSumQryImplBean.xml"),
		func:"EM_CMF_WaitTaskSumQry.EM_CMF_WaitTaskSumQry_Port.EMCMFWaitTaskSumQry",
		Params:arg,
		BasicAuth:global.TXSOAPAuth,
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