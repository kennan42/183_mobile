var MEAP=require("meap");
var path = require("path");

function run(Param,Robot,Request,Response,IF)
{
	var arg = JSON.parse(Param.body.toString());
	var option={
		//wsdl:global.TX_TRAVEL_URL_PRE  + "/EM_CMB_BatchApr/EMCMBBatchAprImplBean?wsdl",
		wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"EM_CMB_BatchApr.xml"),
		func:"EM_CMB_BatchApr.EM_CMB_BatchApr_Port.EMCMBBatchApr",
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
