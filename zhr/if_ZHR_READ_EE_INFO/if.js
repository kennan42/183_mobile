var MEAP=require("meap");
var path = require("path");

function run(Param,Robot,Request,Response,IF){
        var arg = JSON.parse(Param.body.toString());
        var option={
            //wsdl:global.TX_DOMAIN_URL_PRE + "/sap/bc/srt/wsdl/flv_10002A111AD1/srvc_url/sap/bc/srt/rfc/sap/zhrws2111/800/zhrws2111/zhrws2111?sap-client=800",
            wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"ZHR_READ_EE_INFO.xml"),
            func:"ZHR_READ_EE_INFO.ZHR_READ_EE_INFO.ZHR_READ_EE_INFO_FROM_TAB",
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
