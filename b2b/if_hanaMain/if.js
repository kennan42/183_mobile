var MEAP = require("meap");

function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var url ="http://hanadev.cttq.com:8000/cttqdc/services/erp/sd/salesorders/"+arg.table+".xsodata/"+arg.input+"/"+arg.entity+arg.query;
    if(arg.entity == 'RBQuery'){
        url ="http://hanadev.cttq.com:8000/cttqdc/services/erp/sd/saledoc/"+arg.table+".xsodata/"+arg.input+"/"+arg.entity+arg.query;
	}
	    //dev-url
    var option={
        agent:false,
         method : "GET",
         url:url,
         BasicAuth : global.HanaAuth
    };
    if(global.wsdl == 'wsdl_test' || global.wsdl == 'wsdl_qas900'){//qas
        url ="http://hanaqas.cttq.com:8011/cttqdc/services/erp/sd/salesorders/"+arg.table+".xsodata/"+arg.input+"/"+arg.entity+arg.query;
        if(arg.entity == 'RBQuery'){
            url ="http://hanaqas.cttq.com:8011/cttqdc/services/erp/sd/saledoc/"+arg.table+".xsodata/"+arg.input+"/"+arg.entity+arg.query;
        }
        option={
            method : "GET",
            url:url,
            Headers:{"Authorization":"Basic Q1RUUV9BUFA6SGFuYV9hcHBfMjAxNA==",
                "Accept":"application/xml,application/atom+xml",
                "User-Agent":"odata4j.org"
            }
        };
    }
    if(global.wsdl == 'wsdl_pro'){//prd
        url ="http://hanaprd.cttq.com:8000/cttqdc/services/erp/sd/salesorders/"+arg.table+".xsodata/"+arg.input+"/"+arg.entity+arg.query;
        if(arg.entity == 'RBQuery'){
            url ="http://hanaprd.cttq.com:8000/cttqdc/services/erp/sd/saledoc/"+arg.table+".xsodata/"+arg.input+"/"+arg.entity+arg.query;
        }
        option={
            method : "GET",
            url:url,
            Headers:{"Authorization":"Basic Q1RUUV9BUFA6SEFOQV9oYXBhcHBfMjAxNA==",
                "Accept":"application/xml,application/atom+xml",
                "User-Agent":"odata4j.org"
            }
        };
    }
    
    url.replace(/'/g,"%27").replace(/ /g,"%20").replace(/([\u4e00-\u9fa5]+)/g,encodeURI("$1"));
    
    
    
    
    //qas hanaqas.cttq.com(10.10.1.104) 8011  cttq_app 
    //dev hanadev.cttq.com(10.10.1.104) 8000
    //prd hanaprd.cttq.com(10.10.1.99) 8000
    // var url ="http://hanadev.cttq.com:8000/cttqdc/services/erp/sd/salesorders/"+arg.table+".xsodata/"+arg.entity+arg.query;
    // if(arg.entity == 'RBQuery'){
        // url ="http://hanadev.cttq.com:8000/cttqdc/services/erp/sd/saledoc/"+arg.table+".xsodata/"+arg.entity+arg.query;
    // }
    // url.replace(/'/g,"%27").replace(/ /g,"%20").replace(/([\u4e00-\u9fa5]+)/g,encodeURI("$1"));
    // //prd
    // var option={
         // method : "GET",
         // url:url,
         // Headers:{"Authorization":"Basic Q1RUUV9BUFA6SEFOQV9oYXBhcHBfMjAxNA==",
                // "Accept":"application/xml,application/atom+xml",
                // "User-Agent":"odata4j.org"
        // }
//             
//          
        // };
        // //dev
        // var option={
         // method : "GET",
         // url:url,
         // Headers:{"Authorization":"Basic T0RBVEFfVEVTVDpIYW5hMTIzLmNvbQ==",
                // "Accept":"application/xml,application/atom+xml",
                // "User-Agent":"odata4j.org"
            // } 
        // };
//         
        // //qas
      // var option={
         // method : "GET",
         // url:url,
         // Headers:{"Authorization":"Basic Q1RUUV9BUFA6SGFuYV9hcHBfMjAxNA==",
                // "Accept":"application/xml,application/atom+xml",
                // "User-Agent":"odata4j.org"
        // }
//             
//          
        // };

MEAP.AJAX.Runner(option, function(err, res, data) {
    Response.setHeader("Content-type","text/json;charset=utf-8");
    
    if (!err) {
        console.log("data",data);
        Response.end(data);
    } else {
        Response.end(err);
    }
}, Robot);
}

exports.Runner = run;

