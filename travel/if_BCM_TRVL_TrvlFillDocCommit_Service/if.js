var MEAP=require("meap");
var path = require("path");

function run(Param,Robot,Request,Response,IF)
{
	var arg = JSON.parse(Param.body.toString());
	var option={
		//wsdl:global.TX_TRAVEL_URL_PRE  + "/BCM_TRVL_TrvlFillDocCommit_Service/BCMTRVLTrvlFillDocCommitServiceImplBean?wsdl",
		wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"BCM_TRVL_TrvlFillDocCommit_Service.xml"),
		func:"BCM_TRVL_TrvlFillDocCommit_Service.BCM_TRVL_TrvlFillDocCommit_Service_Port.TrvlFillDocCommit",
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
