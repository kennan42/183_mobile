var MEAP = require("meap");
var path = require("path");

/**
 * 系统员工司龄,费用报销,技术职务级别接口
 * @author donghua.wang
 * @date 2015年07月20日
 * */
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var paramJSON = {
        "IS_PUBLIC":{
            "FLOWNO":"",
            "PERNR":arg.userId,
            "ZDOMAIN":400,
            "I_PAGENO":1,
            "I_PAGESIZE":10
        },
        "IT_PERNR":{
            "item":{"PERNR":arg.userId}
        },
        "IT_UNCOMMON":{
            "item":["YGSL","BXLB","BUKRS","JSZWJB"]
        }
    };
    var option = {
        wsdl : path.join(__dirname.replace(IF.name, ""), global.wsdl, "zhrws_uncommon.xml"),
        func : "ZHRWS_UNCOMMON.ZHRWS_UNCOMMON.ZHRWS_UNCOMMON",
        Params : paramJSON,
	
        agent:false
    };

    MEAP.SOAP.Runner(option, function(err, res, data) {
        Response.setHeader("Content-Type", "text/json;charset=utf-8");
        if (!err) {
            Response.end(JSON.stringify({
                "status":"0",
                "data":data
            }));
        } else {
            console.log("getSilingInfo err--->", err);
            Response.end(JSON.stringify({
                status : '-1',
                message : 'Error'
            }));
        }
    });
}

exports.Runner = run;
