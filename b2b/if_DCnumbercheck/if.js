var MEAP=require("meap");
var xml2js = require('xml2js');
function run(Param, Robot, Request, Response, IF)
{
    Response.setHeader("Content-Type", "application/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
    var preURL = "http://10.10.1.104:8000/";
    var hanaNamePrssword = 'Basic T0RBVEFfVEVTVDpIYW5hMTIzLmNvbQ==';
    if (global.wsdl == "wsdl_test" || global.wsdl == 'wsdl_qas900') {
        preURL = "http://10.10.1.104:8011/";
        hanaNamePrssword = 'Basic Q1RUUV9BUFA6SGFuYV9hcHBfMjAxNA==';
    }
    if (global.wsdl == 'wsdl_pro') {
        preURL = "http://10.10.1.99:8000/";
        hanaNamePrssword = 'Basic Q1RUUV9BUFA6SEFOQV9oYXBhcHBfMjAxNA==';
    }
    var KUNNR_OUT = arg.KUNNR_OUT;
    var KUNNR_IN = arg.KUNNR_IN;
    var MATNR_IN = arg.MATNR_IN;
    var DAY_IN = arg.DAY_IN;
    var hanaURL = preURL + "cttqdc/services/erp/sd/dccheck/DCnumbercheck.xsodata/Input(KUNNR_OUT=':KUNNR_OUT',KUNNR_IN=':KUNNR_IN',"
                  +"MATNR_IN=':MATNR_IN',DAY_IN=':DAY_IN')/Results?$metadata";
    hanaURL = hanaURL.replace(":KUNNR_OUT",KUNNR_OUT).replace(":KUNNR_IN",KUNNR_IN).replace(":MATNR_IN",MATNR_IN).replace(":DAY_IN",DAY_IN);
    console.log("--->", hanaURL);
    hanaURL = hanaURL.replace(/'/g, "%27").replace(/ /g, "%20").replace(/([\u4e00-\u9fa5]+)/g, encodeURI("$1"));
    console.log("--->", hanaURL);

    /*var option = {
        agent : false,
        method : "GET",
        url : hanaURL,
        Cookie : "true",
        Headers : {
            "Authorization" : hanaNamePrssword,
            "Accept" : "application/xml,application/atom+xml",
            "User-Agent" : "odata4j.org"
        }
    };
    */
     var option = {
        agent : false,
        method : "GET",
        url : hanaURL,
        BasicAuth : global.HanaAuth

    };

    MEAP.AJAX.Runner(option, function(err, res, data) {
        console.log("转化之前："+data);
        if (!err) {
            xml2js.parseString(data, function(e, r) {
                console.log("转化之后："+r);
                Response.end(JSON.stringify({
                    "status" : "0",
                    "data" : r
                }));
            });

        } else {
            Response.end(JSON.stringify({
                "status" : "-1"
            }));
        }
    }, Robot);
}

exports.Runner = run;


                                

    

