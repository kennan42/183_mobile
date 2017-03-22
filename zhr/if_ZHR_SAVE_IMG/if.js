var MEAP=require("meap");
var fs = require("fs");
var path = require("path");

function run(Param,Robot,Request,Response,IF)
{
	var filepath = Param.files.file.path;
	var filename =  Param.files.file.name;
	var filesize =  Param.files.file.size;
	var data = fs.readFileSync(filepath);
	var doc = data.toString("base64");
	var option = {
					wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"ZHR_SAVE_DOCUMENTS.xml"),
					func: "ZHRWS2112.ZHRWS2112_soap12.ZHRWS2112",
					Params: {
							DOCUMENT: "",
							DOCUMENT2: doc,
							DOC_SIZE:filesize,
							DOU_NAME:filename
						},
					BasicAuth: global.TXSOAPAuth,
					agent:false
				};
	
	MEAP.SOAP.Runner(option,function(err,res,data){
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
