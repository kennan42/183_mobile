var MEAP = require("meap");
var fs = require("fs");

function run(Param, Robot, Request, Response, IF){
	try {
		var filepath = Param.files.file.path;
		fs.readFile(filepath, function(err, data){
			//fs.unlink(filepath);
			if (!err) {
				var doc = data.toString("base64");
				var option = {
					wsdl: "http://cttqdev.cttq.com:8000/sap/bc/srt/wsdl/flv_10002A111AD1/bndg_url/sap/bc/srt/rfc/sap/zhrws2112/800/zhrws2112/zhrws2112?sap-client=800",
					func: "ZHRWS2112.ZHRWS2112_soap12.ZHRWS2112",
					Params: {
						DOCUMENT: "",
						DOCUMENT2: doc,
						DOC_SIZE: Param.files.file.size,
						DOU_NAME: Param.files.file.name
					},
					BasicAuth: {
						username: "hrws",
						password: "123456"
					},
					agent:false
				};
				MEAP.SOAP.Runner(option, function(err, res, data){
					Response.setHeader("Content-type", "text/json;charset=utf-8");
					if (!err) {
						Response.end(JSON.stringify({
							status: 0,
							data: data
						}));
					}
					else {
						Response.statusCode = 404;
						Response.end(JSON.stringify({
							status: -1,
							message: "Upload File Failed"
						}));
					}
				});
				
			}
			else {
				Response.statusCode = 404;
				Response.end(JSON.stringify({
					status: -1,
					message: "Upload File Failed"
				}));
			}
		})
	}
	catch(e)
	{
		Response.statusCode = 404;
				Response.end(JSON.stringify({
					status: -1,
					message: "Upload File Failed"
				}));
	}
}

exports.Runner = run;
