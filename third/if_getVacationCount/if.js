var MEAP = require("meap");
var path = require("path");

/**
 * 查询事假病假接口
 * @author donghua.wang
 * @date 2015年05月28日 13:14
 * */
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var paramJSON = {
        "APPROVAL":"X",
        "AWART":arg.AWART,
        "BEGDA":arg.BEGDA,
        "ENDDA":arg.ENDDA,
        "IS_PUBLIC":{
            "FLOWNO":"",
            "PERNR":arg.PERNR,
            "ZDOMAIN":"",
            "I_PAGENO":"",
            "I_PAGESIZE":""
        },
        "T_PERNR":{
            "item":[
                {"PERNR":arg.PERNR}
            ]
        }
    };
    var option = {
        //wsdl:"http://cttqdev.cttq.com:8000/sap/bc/srt/wsdl/flv_10002A111AD1/bndg_url/sap/bc/srt/rfc/sap/zhrws2106/800/zhrws2106/zhrws2106?sap-client=800",
        wsdl : path.join(__dirname.replace(IF.name, ""), global.wsdl, "zhrws2106.xml"),
        func : "ZHRWS2106.ZHRWS2106.ZHRWS2106",
        Params : paramJSON,
        BasicAuth : global.TXSOAPAuth,
        agent:false
    };

    MEAP.SOAP.Runner(option, function(err, res, data) {
        Response.setHeader("Content-Type", "text/json;charset=utf-8");
        if (!err) {
            var count = 0;
            if(data.T_COUNT.item != null){
                count = data.T_COUNT.item[0].COUNT;
            }
            /*
            var num1 = parseInt(count);
            var num2 = parseFloat(count);
            if(num2 > num1){
                count = parseInt(count) + 1;
            }*/
            Response.end(JSON.stringify({
                "status" : "0",
                "msg" : "success",
                "count" : count
            }));
        } else {
            console.log("getVacationCount err--->", err);
            Response.end(JSON.stringify({
                status : '-1',
                msg : 'Error'
            }));
        }
    });
}

exports.Runner = run;
