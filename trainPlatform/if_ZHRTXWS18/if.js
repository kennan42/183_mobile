var MEAP=require("meap");
var path = require("path");

/**
 * @author:zrx
 * @time:2016.5.17
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param,Robot,Request,Response,IF)
{
    var arg = JSON.parse(Param.body.toString());
    var option={
        //wsdl:"http://cttqdev.cttq.com:8000/sap/bc/srt/wsdl/flv_10002A111AD1/bndg_url/sap/bc/srt/rfc/sap/zhrtxws18/900/zhrtxws18/zhrtxws18?sap-client=900",
        wsdl: path.join(__dirname.replace(IF.name, ""), global.wsdl2, "zhrtxws18.xml"),
        func:"ZHRTXWS18.ZHRTXWS18.ZHRTXWS18",
        Params:{  
                     "IT_PXLL": { 
                      "item" : arg
             }
}
    };
    
    MEAP.SOAP.Runner(option,function(err,res,data){
        Response.setHeader("Content-type", "text/json;charset=utf-8");  
        if(!err)
        {
            console.log(JSON.stringify(data));
             if(data.ET_PUBLIC.item[0].TYPE==0){ 
                   Response.end(JSON.stringify({status: '0', data:data}));
              }else{
                   Response.end(JSON.stringify({status:'-1', data:data}));
              }
        }
        else
        {
            Response.end(JSON.stringify({status:'-1',message:'Error'}));
        }
    });
}

exports.Runner = run;