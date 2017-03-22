var MEAP = require("meap");
var path = require("path");

function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    console.log("arg--->", arg);
    var option = {
        wsdl : path.join(__dirname.replace(IF.name, ""), global.wsdl, "zhrws2120.xml"),
        func : "ZHRWS2120.ZHRWS2120_soap12.ZHRWS2120",
        Params : arg,
        BasicAuth:global.TXSOAPAuth,
        agent:false
    };

    MEAP.SOAP.Runner(option, function(err, res, data) {
        console.log("data--->",JSON.stringify(data));
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        var items = data.ET_ALLOTCNT.item;
        var salary = true;//默认为可以查询薪资
        var check = true;
        var overtime = true;
        var leave = true;
        for (var i in items) {
            var item = items[i];
            if (item.ZRCID == "TX_QUERY_PERSON" && item.VALUE1 != null) {
                var value1 = item.VALUE1;
                if(value1.indexOf("SALARY") != -1){
                    salary = false;
                }
                if(value1.indexOf("CHECK") != -1){
                    check = false;
                }
                if(value1.indexOf("OVERTIME") != -1){
                    overtime = false;
                }
                if(value1.indexOf("LEAVE")!= -1){
                    leave = false;
                }
                
            }
        }
        if (!err) {
            Response.end(JSON.stringify({
                "status":"0",
                "salary":salary,
                "check":check,
                "overtime":overtime,
                "leave":leave
            }));
        } else {
            Response.end(JSON.stringify({
                status : '-1',
                message : '调用webservice接口失败'
            }));
        }
    });
}

exports.Runner = run;
