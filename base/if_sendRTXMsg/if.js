var MEAP = require("meap");
var async = require("async");
/**
 * 根据用户id进行RTX推送
 * */
function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-type", "text/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
    var rtxId = null;
    async.series([
    //根据用户id查询RTX账号
    function(cb) {
        var option = {
            agent:false,
            method : "POST",
            url : global.baseURL + "/zhrws/zhrwsmss11",
            Body : {
                "P_DATE" : "",
                "P_PERNR" : {
                    "item" : [{
                        "PERNR" : arg.userId
                    }]
                }
            }
        };
        MEAP.AJAX.Runner(option, function(err, res, data) {
            if (!err) {
                data = JSON.parse(data);
                if(data.BASE_INFO.item != null && data.BASE_INFO.item.length > 0){
                   rtxId = data.BASE_INFO.item[0].RTX;
                   cb(null,"");
                }else{
                    Response.end(JSON.stringify({
                        "status":"1",
                        "flag":"0",
                        "msg":"没有查询到RTX账号"
                    }));
                }
            }
        },Robot);
    },
    //RTX推送
    function(cb) {
        console.log(rtxId);
        var msg = {
            "tns:strReceiver" : rtxId,
            "tns:MESSAGE_ID" : new Date().getTime(),
            "tns:bstrMsg" : arg.title
        };
        var wsdl = "http://192.168.2.28:8234/SendNotifyWebService.asmx?wsdl";
        if(global.wsdl == "wsdl_pro"){
            wsdl = "762134567890-987654ertylhsafghj";
        }
        var option = {
            wsdl : wsdl,
            func : "SendNotifyWebService.SendNotifyWebServiceSoap.SendNotify",
            Params : msg,
            agent:false
        };

        MEAP.SOAP.Runner(option, function(err, res, data) {
            console.log("------------->", data);
            var flag = "1";
            var msg = "推送RTX消息成功";
            if(data.indexOf("成功") == -1){
                flag = "0";
                msg = "推送RTX消息失败";
            }
            Response.end(JSON.stringify({
                        "status":"1",
                        "flag":flag,
                        "msg":msg
                    }));
        });
    }]);
}

exports.Runner = run;
