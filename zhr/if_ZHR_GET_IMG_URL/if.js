var MEAP = require("meap");
var path = require("path");
var cp = require("child_process");
var fs = require("fs");

function run(Param, Robot, Request, Response, IF){
    var option = {
        wsdl: path.join(__dirname.replace(IF.name, ""), global.wsdl, "ZHR_DOWNLOAD_DOCUMENT.xml"),
        func: "ZHRWS2113.ZHRWS2113_soap12.ZHRWS2113",
        Params: {
            DOC_ID: Param.params.DOC_ID
        },
        BasicAuth: global.TXSOAPAuth,
        agent:false
    };
    
    MEAP.SOAP.Runner(option, function(err, res, data){
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err) {
            if (data.RETURN_SUBRC == '0') {
                var dstIP = "";
                var nginxIP = "";
                if (global.wsdl == "wsdl_dev") {
                    dstIP = "10.10.1.182";
                    nginxIP = "10.10.1.182"
                }
                else 
                    if (global.wsdl == "wsdl_test") {
                        dstIP = "10.10.1.151";
                        nginxIP = "10.10.1.151"
                    }
                    else {
                        dstIP = "10.10.1.149";
                        nginxIP = "ai.cttq.com"
                    }
                var url = "http://" + nginxIP + ":8888/doc/" + data.DOU_NAME;
                
                var option1 = {
                    method: "GET",
                    url: url,
                    Cookie: "true"
                };
                MEAP.AJAX.Runner(option1, function(err, res, data1){
                    if (!err && res.statusCode == 200) {
                        Response.end(JSON.stringify({
                            status: '0',
                            url: url,
                            filename: data.DOU_NAME
                        }));
                    }
                    else {
                        var d = new Buffer(data.DOCUMENT2, "base64");
                        var filepath = "/tmp/" + data.DOU_NAME;
                        fs.writeFileSync(filepath, d);
                        var cmd = "scp " + filepath + " root@" + dstIP + ":" + "/usr/share/nginx/html/doc";
                        cp.exec(cmd, function(err, stdout, stderr){
                            if (!err) {
                                Response.end(JSON.stringify({
                                    status: '0',
                                    url: url,
                                    filename: data.DOU_NAME
                                }));
                            }
                            else {
                                Response.end(JSON.stringify({
                                    status: '-1',
                                    message: 'Error'
                                }));
                            }
                        });
                    }
                });
            }
            else {
                Response.end(JSON.stringify({
                    status: '-1',
                    message: '获取失败'
                }));
            }
            
        }
        else {
            Response.end(JSON.stringify({
                status: '-1',
                message: 'Error'
            }));
        }
    });
}

exports.Runner = run;
