var MEAP=require("meap");
var path = require("path");

function run(Param,Robot,Request,Response,IF)
{
	var arg = JSON.parse(Param.body.toString());
	var option={
		//wsdl:global.TX_TRAVEL_URL_PRE  + "/EM_TRVL_SsdCnt/EMTRVLSsdCntImplBean?wsdl",
		wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"EM_TRVL_SsdCnt.xml"),
		func:"EM_TRVL_SsdCnt.EM_TRVL_SsdCnt_Port.EM_TRVL_SsdCnt",
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
