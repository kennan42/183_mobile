var MEAP = require("meap");

function run(Param, Robot, Request, Response, IF) {
    var req = JSON.parse(Param.body.toString());
    var callbackurl = "http://aidev.cttq.com/exp/callbackExp";
   
    var arg = {
        "company" :req.com,
        "number" : req.num,
        //"to" : "北京朝阳",暂时不传递该参数，但是无法判断签收和退签
        "key" : "UtDjKnOd2426",
        "parameters" : {
            "callbackurl" : callbackurl,
            "salt" : ""
        }
    };
    var option = {
        method : "POST",
        url : "http://www.kuaidi100.com/poll",
        Cookie : "false",
        Body : {
            "schema" : "json",
            "param" : JSON.stringify(arg)
        },
        Enctype : "application/x-www-form-urlencoded"
    };

    MEAP.AJAX.Runner(option, function(err, res, data) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err) {
            Response.end(data);
        } else {
            Response.end(JSON.stringify({
                "result" : "false",
                "returnCode" : "400",
                "message" : "请求订阅服务失败"

            }));
        }
    }, Robot);
}

exports.Runner = run;

