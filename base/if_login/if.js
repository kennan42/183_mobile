var MEAP=require("meap");
var path = require("path");

function run(Param,Robot,Request,Response,IF)
{
	var arg = JSON.parse(Param.body.toString());
	var invokeUser='cttq';
    var invokePassword='cttq123.com';
	var option={
		//旧的wsdl:"http://192.168.2.48/AdService/AdWebService.asmx?wsdl",
		//新的wsdl   http://192.168.1.93/AdWebServiceiv/AdWebService.asmx?wsdl
		wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"AdWebService.xml"),
		func:"AdWebService.AdWebServiceSoap.CheckUser2",
		Params:'<cttq:CheckUser2>'
			+'<cttq:loginName>' + arg.loginName + '</cttq:loginName>'
			+'<cttq:password>' + arg.password + '</cttq:password>'
			+'<cttq:invokeUser>' + invokeUser + '</cttq:invokeUser>'
			+'<cttq:invokePassword>' + invokePassword + '</cttq:invokePassword>'
			+'<cttq:invokeApp></cttq:invokeApp>'
		+'</cttq:CheckUser2>',
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
