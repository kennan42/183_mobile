var MEAP=require("meap");
var path = require("path");
function run(Param, Robot, Request, Response, IF)
{
	console.log(1);

	var arg = JSON.parse(Param.body.toString());
   /* var option={
       
        wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl2,"zhrtxws10.xml"),
        func:"ZHRTXWS10.ZHRTXWS10.ZHRTXWS10",
        Params:reqParam,
        
        agent:false
    };*/
    
    
    /*var option = {
            "wsdl" : path.join(__dirname.replace(IF.name, ""), global.wsdl, "zhrtxws10.xml"),
            "func" : "ZHRTXWS10.ZHRTXWS10.ZHRTXWS10",
            "Params" : reqParam,
            "agent" : false
        };*/
    
    
    var reqJSON = {
            "IS_PUBLIC" : {
                "FLOWNO" : "",
                "PERNR" : "",
                "ZDOMAIN" : "",
                "I_PAGENO" : "",
                "I_PAGESIZE" : ""
            },
            "I_KEYDATE" : "",
            "IM_ADDDATA" : "X"
        };
        var option = {
            "wsdl" : path.join(__dirname.replace(IF.name, ""), global.wsdl, "zhrtxws10.xml"),
            "func" : "ZHRTXWS10.ZHRTXWS10_soap12.ZHRTXWS10",
            "Params" : reqJSON,
            "agent" : false
        };
    
    
    
    MEAP.SOAP.Runner(option, function(err, res, data) {
           if(!err)
        {
            Response.end(JSON.stringify(data));
        }
        else
        {
            Response.end(JSON.stringify({status:'-1',message:'Error'}));
        }
        });
    
  /*  MEAP.SOAP.Runner(option,function(err,res,data){
        Response.setHeader("Content-type","text/json;charset=utf-8");
        if(!err)
        {
            Response.end(JSON.stringify(data));
        }
        else
        {
            Response.end(JSON.stringify({status:'-1',message:'Error'}));
        }
    });*/
}

exports.Runner = run;


                                

	

