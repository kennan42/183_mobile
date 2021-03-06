var MEAP=require("meap");
var path = require("path");

/**
 * @author:zrx
 * 读取员工职务类别
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param, Robot, Request, Response, IF)
{ 
    var arg = JSON.parse(Param.body.toString());
    var option = {
        //wsdl: "http://cttqdev.cttq.com:8000/sap/bc/srt/wsdl/flv_10002A111AD1/bndg_url/sap/bc/srt/rfc/sap/zhrtxws11/800/zhrtxws11/zhrtxws11?sap-client=800",
        wsdl: path.join(__dirname.replace(IF.name, ""), global.wsdl2, "zhrtxws17.xml"),
        func: "ZHRTXWS17.ZHRTXWS17.ZHRTXWS17",
        Params: arg,
        BasicAuth: global.TXSOAPAuth,
        agent: false
    };

    MEAP.SOAP.Runner(option, function (err, res, data) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");  
        if (!err) {
            Response.end(JSON.stringify({status:'0',msg:"调用成功",data:data}));
        }
        else {
            Response.end(JSON.stringify({status: '-1', msg: err}));
        }
    });
}

exports.Runner = run;


                                

	

