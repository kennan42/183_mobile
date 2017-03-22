var MEAP = require("meap");

function run(Param, Robot, Request, Response, IF) {
    console.log("comein");
     var url ="http://10.10.1.104:8000/cttqdc/services/erp/sd/salesorders/ReturnBatchQuery.xsodata/RBQuery?$top=10&$format=json&$inlinecount=allpages&$skip=10&$filter=MJAHR%20ge%20%272012%27&$select=MATNR,MENGE";
     url.replace(/'/g,"%27").replace(/ /g,"%20").replace(/([\u4e00-\u9fa5]+)/g,encodeURI("$1"))
     console.log(url);
    var option={
         method : "GET",
         url:url,
         BasicAuth : global.HanaAuth,
        agent:false
        };

MEAP.AJAX.Runner(option, function(err, res, data) {
    Response.setHeader("Content-type","text/json;charset=utf-8");
    console.log("data--->>",data);
    if (!err) {
        console.log("data",data);
        Response.end(data);
    } else {
        Response.end(err);
    }
}, Robot);
}

exports.Runner = run;

