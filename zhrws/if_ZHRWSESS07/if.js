var MEAP=require("meap");
var path = require("path");

function run(Param,Robot,Request,Response,IF)
{
	var arg = JSON.parse(Param.body.toString());
	var option={
		//wsdl:"http://cttqdev.cttq.com:8000/sap/bc/srt/wsdl/flv_10002A111AD1/bndg_url/sap/bc/srt/rfc/sap/zhrwsess07/800/zhrwsess07/zhrwsess07?sap-client=800",
		wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"ZHRWSESS07.xml"),
		func:"ZHRWSESS07.ZHRWSESS07_soap12.ZHRWSESS07",
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
