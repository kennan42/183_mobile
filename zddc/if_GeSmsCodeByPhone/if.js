var MEAP=require("meap");
var path = require("path");
var mongoose = require("mongoose");
var baseSchema = require("../../base/BaseSchema.js");
var util = require("../../base/util.js");

function run(Param,Robot,Request,Response,IF)
{
	var arg = JSON.parse(Param.body.toString());
	var option={
		//wsdl:"http://192.168.2.48/AdService/AdWebService.asmx?wsdl",
		wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"AdWebService.xml"),
		func:"AdWebService.AdWebServiceSoap.GeSmsCodeByPhone2",
		Params:'<cttq:GeSmsCodeByPhone2>'
	         +'<cttq:guid>'+arg.guid+'</cttq:guid>'
	         +'<cttq:phoneNo>'+arg.phoneNo+'</cttq:phoneNo>'
	         +'<cttq:invokeUser>'+arg.invokeUser+'</cttq:invokeUser>'
	         +'<cttq:invokePassword>'+arg.invokePassword+'</cttq:invokePassword>'
	         +'<cttq:invokeApp>'+arg.invokeApp+'</cttq:invokeApp>'
			 +'</cttq:GeSmsCodeByPhone2>',
		BasicAuth:global.TXSOAPAuth,
		agent:false 
	};
	
	MEAP.SOAP.Runner(option,function(err,res,data){
		Response.setHeader("Content-type","text/json;charset=utf-8");
		if(!err)
		{
			Response.end(JSON.stringify(data));
			addInvokeLog(arg,data);
		}
		else
		{
			Response.end(JSON.stringify({status:'-1',message:'Error'}));
		}
	});
}

function addInvokeLog(arg,data){
	if(arg.userId != null){
		var conn = mongoose.createConnection(global.mongodbURL);
		var baseWebserviceInvokeLogModel = conn.model("base_webservice_invokelog",baseSchema.baseWebserviceInvokeLogSchema);
		var baseWebserviceInvokeLog = new baseWebserviceInvokeLogModel({
			"userId":arg.userId,
			"input":arg,
			"output":data,
			"createTime":util.getDateStrFromTimes(new Date().getTime(),true)
		});
		baseWebserviceInvokeLog.save(function(err){
			conn.close();
			console.log("save invoke webservice log over");
		});
	}
}

exports.Runner = run;
