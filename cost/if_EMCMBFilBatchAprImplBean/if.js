var MEAP=require("meap");
var path = require("path");

function run(Param,Robot,Request,Response,IF)
{
    var arg = JSON.parse(Param.body.toString());
	var headers = Request.headers;
	var username = headers.username;
	var password = headers.password;
	if(username == null || password == null){
		Response.end(JSON.stringify({status:'-1',message:'授权信息为空'}));
				return;
	}
    var option={
        wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"EMCMBFilBatchAprImplBean.xml"),
        func:"EM_CMB_FilBatchApr.EM_CMB_FilBatchApr_Port.EMCMBFilBatchApr",
        Params:arg,
		BasicAuth:{"username":username,"password":password},
		agent:false
    };
    
    MEAP.SOAP.Runner(option,function(err,res,data){
        Response.setHeader("Content-type","text/json;charset=utf-8");
        if(!err)
        {
			 if(data.text != null && typeof data.text == "string" && data.text.indexOf("Authentication failed") != -1){
                Response.end(JSON.stringify({status:'-1',message:'授权失败'}));
                return;
            }
            Response.end(JSON.stringify(data));
        }
        else
        {
            Response.end(JSON.stringify({status:'-1',message:'调用webservice接口失败'}));
        }
    });
}

exports.Runner = run;
