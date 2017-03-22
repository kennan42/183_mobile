var MEAP=require("meap");
var path = require("path");
/**
 * @author:xialin
 * 判断是否存储身份证
 * 2016-8-15
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
        //http://cttqdev.cttq.com:8000/sap/bc/srt/wsdl/flv_10002A111AD1/bndg_url/sap/bc/srt/rfc/sap/zhrwsrz05/900/zhrwsrz05/zhrwsrz05?sap-client=900
        wsdl: path.join(__dirname.replace(IF.name, ""), global.wsdl2, "zhrwsrz09.xml"),
        func: "ZHRWSRZ09.ZHRWSRZ09.ZHRWSRZ09",
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


                                

    

