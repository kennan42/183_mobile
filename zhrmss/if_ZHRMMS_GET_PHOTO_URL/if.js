var MEAP = require("meap");
var path = require("path");
var cp = require("child_process");
var fs = require('fs');
var gm = require("gm");
var imageMagick = gm.subClass({
    imageMagick : true
});

function run(Param, Robot, Request, Response, IF) {
    var userid = Param.params.P_PERNR;
    var dstIP = "";
    var nginxIP = "";
    if (global.wsdl == "wsdl_dev") {
        dstIP = "10.10.1.182";
        nginxIP = "218.92.66.228"
    } else if (global.wsdl == "wsdl_test" || global.wsdl == "wsdl_qas900") {
        dstIP = "10.10.1.151";
        nginxIP = "aiqas.cttq.com"
    } else {
        dstIP = "10.10.1.149";
        nginxIP = "ai.cttq.com"
    }
    var url = "http://" + nginxIP + ":8888/uploads/" + "compressed_" + userid + ".jpg";
    var option1 = {
    	 agent:false,
        method : "GET",
        url : url,
        Cookie : "true"
    };
    MEAP.AJAX.Runner(option1, function(err, res, data1) {
        if (!err && res.statusCode == 200) {
            Response.end(JSON.stringify({
                status : '0',
                url : url,
                filename : "compressed_" + userid + ".jpg"
            }));
        } else {
            var arg = {
                "IT_EXTENDMAP" : {
                    "item" : [{
                        "FIELDNAME" : '',
                        "VALUE" : ''
                    }]
                },
                "I_PUBLIC" : {
                    "CHANNELSERIALNO" : '',
                    "ORIGINATETELLERID" : '',
                    "ZDOMAIN" : '100',
                    "I_PAGENO" : '',
                    "I_PAGESIZE" : '',
                    "ZVERSION" : ''
                },
                "P_PERNR" : userid
            };
            var option = {
                wsdl : path.join(__dirname.replace(IF.name, ""), global.wsdl, "ZHRMMS_READ_PHOTO.xml"),
                func : "ZHRWSMSS05.ZHRWSMSS05_soap12.ZHRWSMSS05",
                Params : arg,
                agent:false
            };
            MEAP.SOAP.Runner(option, function(err, res, data) {
                Response.setHeader("Content-type", "text/json;charset=utf-8");
                if (!err) {
                    var code = data.E_PUBLIC.CODE;
                    if (code == "0") {
                        var d = new Buffer(data.B64DATA, "base64");
                        var originalImg = "/tmp/original_" + userid + ".jpg";
                        var compressedImg = "/opt/emm/uploads/compressed_" + userid + ".jpg";
                        fs.writeFileSync(originalImg, d);
                        var imgBuffer = imageMagick(originalImg);
                        imgBuffer.quality(80).resize(96);
                        imgBuffer.write(compressedImg, function(err) {
                            if (!err) {
                                Response.end(JSON.stringify({
                                    status : '0',
                                    url : url,
                                    filename : "compressed_" + userid + ".jpg"
                                }));
                            } else {
                                Response.end(JSON.stringify({
                                    status : '-1',
                                    message : '压缩员工头像失败'
                                }));
                            }
                             fs.unlinkSync(originalImg);
                        });
                    } else {
                        Response.end(JSON.stringify({
                            status : '-1',
                            message : '该员工没有照片'
                        }));
                    }

                } else {
                    Response.end(JSON.stringify({
                        status : '-1',
                        message : '调用webservice获取员工头像失败'
                    }));
                }
            });
        }
    });
}

exports.Runner = run;
