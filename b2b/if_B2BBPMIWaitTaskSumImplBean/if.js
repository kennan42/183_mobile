var MEAP=require("meap");
var path = require("path");

function run(Param,Robot,Request,Response,IF)
{
    console.log("come in");
    var arg = JSON.parse(Param.body.toString());
    var option={
        //wsdl:global.TX_DOMAIN_URL_PRE + "/sap/bc/srt/wsdl/flv_10002A111AD1/srvc_url/sap/bc/srt/rfc/sap/zhrws2215/800/zhrws2215/zhrws2215?sap-client=800",
        wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"B2BBPMIWaitTaskSumImplBean.xml"),
        func:"B2B_BPMI_WaitTaskSum_Service.B2B_BPMI_WaitTaskSum_Port.B2BBPMIWaitTaskSum",
        Params:arg,
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
