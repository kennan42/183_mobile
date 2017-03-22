var MEAP = require("meap");
var path = require("path");
var fs = require("fs");
var gm = require("gm");
var imageMagick = gm.subClass({
    imageMagick : true
});
var mongoose = require("mongoose");
var async = require("async");
var contactSchema = require("../Contact.js");

/**
 * 同步所有用户的照片信息，把照片保存到nginx下，照片的地址和时间信息保存到mongodb
 * @author donghua.wang
 * @date 2015年10月9日 16:08
 * 目前只是demo，使用正式URL后需要替换webservice，time字段,查询所有用户
 * */
function run(Param, Robot, Request, Response, IF) {
    //简单的请求验证
    var headers = Request.headers;
    var host = headers.host;
    if (host.indexOf("localhost") == -1) {
        console.log("auth failed");
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "请求IP错误"
        }));
        return;
    }
    var conn = mongoose.createConnection(global.mongodbURL);
    var userModel = conn.model("base_user", contactSchema.BaseUserSchema);
    userModel.find({}).exec(function(err, data) {
        conn.close();
        getUserPhotos(data, IF);
    });
    Response.end("start get all user photo");
}

function getUserPhotos(users, IF) {
    var photos = [];
    var queue = async.queue(function(task, callback) {
        setTimeout(function() {
            var photoData = null;
            var photoDate = "";
            var hasPhoto = true;
            async.series([
            //获取图片数据
            function(cb) {
                var arg = {
                    "IS_PUBLIC" : {
                        "FLOWNO" : "",
                        "PERNR" : "",
                        "ZDOMAIN" : "",
                        "I_PAGENO" : "",
                        "I_PAGESIZE" : ""
                    },
                    "I_PERNR" : task.PERNR
                };
                var option = {
                    wsdl : path.join(__dirname.replace(IF.name, ""), global.wsdl, "zhrtxws01.xml"),
                    func : "ZHRTXWS01.ZHRTXWS01_soap12.ZHRTXWS01",
                    Params : arg,
                    agent : false
                };
                MEAP.SOAP.Runner(option, function(err, res, data) {
                    if (data.ES_PUBLIC != null && data.ES_PUBLIC.TYPE != null && data.ES_PUBLIC.TYPE == "0") {
                        photoData = data.E_B64DATA;
                        photoDate = data.E_AR_DATE;
                        hasPhoto = true;
                    } else {
                        hasPhoto = false;
                    }
                    cb(err, null);
                });
            },
            //压缩图片
            function(cb) {
                if (hasPhoto) {//压缩图片
                    var photoBinaryData = new Buffer(photoData, "base64");
                    var originalImgName = "original_" + task.PERNR + ".jpg";
                    var originalImgPath = "/opt/emm/uploads/photo/" + originalImgName;
                    var compressImgName = "compress_" + task.PERNR + ".jpg";
                    var compressImgPath = "/opt/emm/uploads/photo/" + compressImgName;
                    fs.writeFileSync(originalImgPath, photoBinaryData);
                    var imgBuffer = imageMagick(originalImgPath);
                    imgBuffer.quality(80).resize(96);
                    imgBuffer.write(compressImgPath, function(err) {
                        photos.push({
                            "userId" : task.PERNR,
                            "status" : 1,
                            "originalImgName" : originalImgName,
                            "compressImgName" : compressImgName,
                            "photoDate" : photoDate
                        });
                        cb(null, "");
                    });
                } else {
                    photos.push({
                        "userId" : task.PERNR,
                        "status" : 0,
                        "photoDate" : photoDate
                    });
                    cb(null, "");
                }

            }], function(err, data) {
                callback(null, "");
            });
        }, 1000);
    }, 80);

    for (var i in users) {
        queue.push(users[i]);
    }

    queue.drain = function() {
        console.log("save user photo url to mongodb");
        savePhotoUrl(photos);
    }
}

//将员工照片地址保存到mongodb
function savePhotoUrl(photos) {
    var conn = mongoose.createConnection(global.mongodbURL);
    var baseUserModel = conn.model("base_user", contactSchema.BaseUserSchema);
    var queue = async.queue(function(task, callback) {
        setTimeout(function() {
            var status = 0;
            var url = "";
            var url2 = "";
            if (task.originalImgName) {
                status = 1;
                url = global.nginxURL + "uploads/photo/" + task.compressImgName;
                url2 = global.nginxURL + "uploads/photo/" + task.originalImgName;
            }
            baseUserModel.update({
                "PERNR" : task.userId
            }, {
				"photoStatus":status,
				"photoURL" : url,
				"photoURL2" : url2,
                "photoUpdateTime" : task.photoDate
            }, function(err) {
                callback(err, "");
            });
        }, 100);
    }, 100);
    for (var i in photos) {
        queue.push(photos[i]);
    }
    queue.drain = function() {
        console.log("get all user photo handle over");
        conn.close();
    }
}

exports.Runner = run;

