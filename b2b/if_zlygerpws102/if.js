var MEAP=require("meap");
var path = require("path");
/**
 * @author:zrx
 * @time:2017.1.16
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param,Robot,Request,Response,IF)
{
    console.log("come in");
    var arg = JSON.parse(Param.body.toString());
    var option={
        //wsdl:"http://cttqdev.cttq.com:8000/sap/bc/srt/wsdl/flv_10002A111AD1/bndg_url/sap/bc/srt/rfc/sap/zlygerpws102/900/zlygerpws102/zlygerpws102?sap-client=900",
        wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl2,"zlygerpws102.xml"),
        func:"ZLYGERPWS102.ZLYGERPWS102.ZLYGERPWS102",
        Params:arg,
        agent:false
    };
    
    MEAP.SOAP.Runner(option,function(err,res,data){
        Response.setHeader("Content-type","text/json;charset=utf-8");
        if(!err)
        {
            Response.end(JSON.stringify({status:'0',data:data}));
        }
        else
        {
            Response.end(JSON.stringify({status:'-1',message:err}));
        }
    });
}

exports.Runner = run;
