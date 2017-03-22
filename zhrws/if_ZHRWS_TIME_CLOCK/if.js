var MEAP=require("meap");
var path = require("path");

function run(Param,Robot,Request,Response,IF)
{
	var arg = JSON.parse(Param.body.toString());
	var option={
		//wsdl:global.TX_DOMAIN_URL_PRE + "/sap/bc/srt/wsdl/flv_10002A111AD1/bndg_url/sap/bc/srt/rfc/sap/zhrws2104/800/zhrws2104/zhrws2104?sap-client=800",
		wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"ZHRWS_TIME_CLOCK.xml"),
		func:"ZHRWS2104.ZHRWS2104_soap12.ZHRWS2104",
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
