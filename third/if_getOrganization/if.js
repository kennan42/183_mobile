var MEAP = require("meap");
var path = require("path");
var crypto = require('crypto');
var async = require("async");

/**
 * 查询组织机构
 * @author donghua.wang
 * @date 2015年05月28日 14:23
 * */
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    if (arg.aesKey == null) {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "请传递密钥"
        }));
        return;
    }
    if (arg.params == null) {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "请传递请求参数信息"
        }));
        return;
    }
    var aesKey = arg.aesKey;
    var encodeStr = arg.params;
    console.log(aesKey,encodeStr);
    try {
        iv = new Buffer(16);
        iv.fill(0);
        var deCipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
        content = deCipher.update(encodeStr, 'base64', 'utf8');
        content += deCipher.final('utf8');
        console.log("content--->",content);
        content = JSON.parse(content);
        Response.setHeader("Content-Type","text/json;charset=utf-8");
        //var wsdl = "http://cttqdev.cttq.com:8000/sap/bc/srt/wsdl/flv_10002A111AD1/bndg_url/sap/bc/srt/rfc/sap/zhrws_org/900/zhrws_org/zhrws_org?sap-client=900";
        var option = {
            wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"zhrws_org.xml"),
            Params:content,
            func:"ZHRWS_ORG.ZHRWS_ORG.ZHRWS_ORG",
            agent:false
        };
        MEAP.SOAP.Runner(option,function(err,res,data){
            if(!err){
                Response.end(JSON.stringify({
                    "status":"0",
                    "msg":"调用webservice接口成功",
                    "data":data
                }));
            }else{
                console.log("getOrganization err--->",err);
                Response.end(JSON.stringify({
                    "status":"-1",
                    "msg":"调用webservice接口失败"
                }));
            }
        });
    } catch(e) {
        console.log("getOrganazation e--------->", e);
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "解密失败"
        }));
    }
}

exports.Runner = run;

