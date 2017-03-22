var MEAP = require("meap");
var path = require("path");

function run(Param, Robot, Request, Response, IF) {
    try {
        var param = JSON.parse(Param.fields.param);
        if(param.status != "abort"){
              saveOrderInfo(param,IF);
        }
      
        Response.end(JSON.stringify({
            "result" : "true",
            "returnCode" : "200",
            "message" : "回调成功"

        }));
    } catch(e) {
        console.log("--->",e);
        Response.end(JSON.stringify({
            "result" : "false",
            "returnCode" : "400",
            "message" : "回调失败"

        }));
    }
}

function saveOrderInfo(param,IF) {
    var arr = [];
    if(param.lastResult.data){
        var data = param.lastResult.data;
        for(var i in data ){
            arr.push({
                EXPRESSID:param.lastResult.com,
                EXPRESSNO:param.lastResult.nu,
                EXPRESSSTAT:param.lastResult.state,
                CONTEXT:data[i].context,
                FTIME:data[i].ftime
            });
        }
    }
   
    var arg = {IS_PUBLIC:{
                    CHANNELSERIALNO:"",
                    ORIGINATETELLERID:"",
                    ZDOMAIN:"400",
                    I_PAGENO:"",
                    I_PAGESIZE:"",
                    ZVERSION:""
                },
                IT_EXPS_STAT:{
                    item:arr
                }};
    var option = {
         wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"zbcmbcodewsforai09.xml"),
        func : "ZBCMBCODEWSFORAI09.ZBCMBCODEWSFORAI09_soap12.ZBCMBCODEFORAI09",
        Params : arg,
        agent:false
    };

    MEAP.SOAP.Runner(option, function(err, res, data) {
        if (!err) {
             console.log("saveOrderInfo success");
        } else {
            console.log("saveOrderInfo error",err);
        }
    });
}

exports.Runner = run;

