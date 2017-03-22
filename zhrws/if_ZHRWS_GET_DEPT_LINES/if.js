var MEAP=require("meap");
var path = require("path");

function run(Param,Robot,Request,Response,IF)
{
	var arg = JSON.parse(Param.body.toString());
	var option={
		wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"GET_DEPT_LINES.xml"),
		func:"ZHRWS2115.ZHRWS2115_soap12.ZHRWS2115",
		Params:arg,
		BasicAuth:global.TXSOAPAuth,
		agent:false
	};
	
	MEAP.SOAP.Runner(option,function(err,res,data){
		if(!err)
		{
			Response.setHeader("Content-type","text/json;charset=utf-8");
			Response.end(JSON.stringify(data));
		}
		else
		{
			Response.end(JSON.stringify({status:'-1',message:'Error'}));
		}
	});
}

exports.Runner = run;
