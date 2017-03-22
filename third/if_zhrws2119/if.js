var MEAP=require("meap");
var path = require("path");

function run(Param,Robot,Request,Response,IF)
{
    var arg = JSON.parse(Param.body.toString());
    var reqParam = {
            "BEGDA":arg.startDate,
            "ENDDA":arg.endDate,
            "IS_PUBLIC":{
              "FLOWNO":"",
              "PERNR":arg.userId,
              "ZDOMAIN":"400",
              "I_PAGENO":"1",
              "I_PAGESIZE":"10",  
            },        
            "T_PERNR":{
                "item":[{"PERNR":arg.userId}]
            }
    };
    var option={
        wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"zhrws2119.xml"),
        func:"ZHRWS2119.ZHRWS2119.ZHRWS2119",
        Params:reqParam,
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
