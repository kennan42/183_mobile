var MEAP=require("meap");
var path = require("path");

function run(Param,Robot,Request,Response,IF)
{
	var arg = JSON.parse(Param.body.toString());
	var option={
		//wsdl:"http://192.168.2.48/AdService/AdWebService.asmx?wsdl",
		wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"AdWebService.xml"),
		func:"AdWebService.AdWebServiceSoap.GetUserInfoByLoginName",
		Params:'<cttq:GetUserInfoByLoginName>'
	         +'<cttq:loginName>'+arg.loginName+'</cttq:loginName>'
	         +'<cttq:invokeUser>'+arg.invokeUser+'</cttq:invokeUser>'
	         +'<cttq:invokePassword>'+arg.invokePassword+'</cttq:invokePassword>'
	         +'<cttq:invokeApp></cttq:invokeApp>'
	      	 +'</cttq:GetUserInfoByLoginName>',
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
