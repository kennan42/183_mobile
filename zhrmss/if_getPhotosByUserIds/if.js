var MEAP = require("meap");
var path = require("path");
var fs = require('fs');
var gm = require("gm");
var imageMagick = gm.subClass({
    imageMagick : true
});
var async = require("async");

var rs = null;
function run(Param, Robot, Request, Response, IF) {
    rs = [];
    var arg = JSON.parse(Param.body.toString());
    var userIds = arg.userIds;
    getPhotos(0, userIds, Response,IF);
}

function getPhotos(i, userIds, Response,IF) {
    i = i || 0;
    var url = global.nginxURL + "uploads/compressed_" + userIds[i] + ".jpg";
    console.log("url--->", url);
    if (i < userIds.length) {
        async.series([
        //判断是否已经存在员工照片
        function(cb) {
            var option = {
                 agent:false,
                method : "GET",
                url : url,
                Cookie : "true"
            };
            MEAP.AJAX.Runner(option, function(err, res, data) {
                if (!err && res.statusCode == 200) {//存在员工照片
                    rs.push({
                        "status" : "0",
                        "msg" : "获取员工照片成功",
                        "userId" : userIds[i],
                        "url" : url
                    });
                    i++;
                    getPhotos(i, userIds, Response,IF);
                } else {
                    cb(err, "");
                }
            });
        },
        //调用webservice接口取货员工照片
        function(cb) {
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
                "P_PERNR" : userIds[i]
            };
            var option = {
                wsdl : path.join(__dirname.replace(IF.name, ""), global.wsdl, "ZHRMMS_READ_PHOTO.xml"),
                func : "ZHRWSMSS05.ZHRWSMSS05_soap12.ZHRWSMSS05",
                Params : arg,
                agent:false
            };
            MEAP.SOAP.Runner(option, function(err, res, data) {
                if (!err) {
                    console.log(data);
                    var code = data.E_PUBLIC.CODE;
                    if (code == "0") {
                        var d = new Buffer(data.B64DATA, "base64");
                        var originalImg = "/tmp/original_" + userIds[i] + ".jpg";
                        var compressedImg = "/opt/emm/uploads/compressed_" + userIds[i] + ".jpg";
                        fs.writeFileSync(originalImg, d);
                        var imgBuffer = imageMagick(originalImg);
                        imgBuffer.quality(80).resize(96);
                        imgBuffer.write(compressedImg, function(err) {
                            if (!err) {
                                rs.push({
                                    "status" : "0",
                                    "msg":"获取照片成功",
                                    "userId" : userIds[i],
                                    "url" : url
                                });
                                i++;
                                getPhotos(i, userIds, Response,IF);
                            } else {
                                rs.push({
                                    "status" : "-1",
                                    "msg" : "压缩照片失败",
                                    "userId" : userIds[i]
                                });
                                i++;
                                getPhotos(i, userIds, Response,IF);
                            }
                        });
                    } else {
                        rs.push({
                            "status" : "-1",
                            "msg" : "该员工没有照片",
                            "userId" : userIds[i]
                        });
                        i++;
                        getPhotos(i, userIds, Response,IF);
                    }

                } else {
                    rs.push({
                        "status" : "-1",
                        "msg" : "调用webservice获取员工头像失败",
                        "userId" : userIds[i]
                    });
                    i++;
                    getPhotos(i, userIds, Response,IF);
                }
            });
        }]);
    } else {
        console.log("rs--->", rs);
       Response.end(JSON.stringify({
           "data":rs
       }));
    }
}

exports.Runner = run;

