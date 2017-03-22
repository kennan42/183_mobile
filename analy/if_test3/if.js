var MEAP=require("meap");

function run(Param, Robot, Request, Response, IF)
{
   var url ="http://10.10.1.104:8000/cttqdc/services/erp/sd/salesorders/orderListQuery.xsodata/Input(P_VBELN='**',P_NAME='*苏州*')/Results?$format=json";
   
   var url2 ="http://10.10.1.104:8000//cttqdc/services/erp/sd/salesorders/ordersbymonth.xsodata/ORDERS?$format=json&$filter= ERDAT ge '20150101'";
     var option={
         method : "GET",
         url:url,
         Headers:{"Authorization":"Basic T0RBVEFfVEVTVDpIYW5hMTIzLmNvbQ==",
                "Accept":"application/xml,application/atom+xml",
                "User-Agent":"odata4j.org"
        },
        agent:false
        };

MEAP.AJAX.Runner(option, function(err, res, data) {
    Response.setHeader("Content-type","text/json;charset=utf-8");
    
    if (!err) {
        
        Response.end(data);
    } else {
        Response.end(err);
    }
}, Robot);
    
}

exports.Runner = run;