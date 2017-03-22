var MEAP = require("meap");
var redis = require("meap_redis");
var mongoose = require("mongoose");
var fs = require("fs");
var gm = require("gm");
var imageMagick = gm.subClass({
    imageMagick : true
});
var contactSchema = require("../Contact.js");
var path = require("path");
var async = require("async");
var contactUtil = require("../util.js");
var util = require("../../base/util.js");

/**
 * 同步员工照片，生产环境现在145上同步，如果145同步成功，则不再在150上进行同步
 * @author donghua.wang
 * @date 2015年10月13日 15:13
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("contact.syncUserPhoto start");
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
    Response.setHeader("Content-Type", "application/json;charset=utf-8");
    var currentDate = util.getDateStrFromTimes(new Date().getTime(), false);
    async.series([
    //判断是否进行了同步
    function(cb) {
        var redisCli = redis.createClient(global.redisPort, global.redisHost);
        redisCli.on("ready", function() {
            redisCli.select(contactUtil.contactConst.redisDB, function() {
                redisCli.get("syncUserPhoto", function(err, data) {
                    redisCli.quit();
                    if (data == null || data != currentDate) {
						console.log("err:",err);
                        cb(err, null);
                    } else {
						console.log("aaaaaaaaaaaaaaaaaa");
                        cb(-1, null);
                    }
                });
            });
        });
    },
    //查询更新照片员工
    function(cb) { 
        var date = util.getDateStrFromTimes(new Date().getTime()-86400*1000, false);;
        date = date.replace(/-/g, "");
        var reqJSON = {
            "IS_PUBLIC" : {
                "FLOWNO" : "",
                "PERNR" : "",
                "ZDOMAIN" : "",
                "I_PAGENO" : "",
                "I_PAGESIZE" : ""
            },
            "I_KEYDATE" : date
        };
        var option = {
            "wsdl" : path.join(__dirname.replace(IF.name, ""), global.wsdl, "zhrtxws02.xml"),
            "func" : "ZHRTXWS02.ZHRTXWS02.ZHRTXWS02",
            "Params" : reqJSON,
            "agent" : false
        };
        MEAP.SOAP.Runner(option, function(err, res, data) {
            cb(0, data);
        });
    }], function(err, data) {
		console.log("是否抱错：",err);
        if (!err) {
            var userPhoto = data[1];
            if (userPhoto.ES_PUBLIC != null && userPhoto.ES_PUBLIC.TYPE != null && userPhoto.ES_PUBLIC.TYPE == "0") {//有员工更新照片
                syncUserPhoto(userPhoto.ET_PERNR.item,IF);
				Response.end(JSON.stringify({
                    "status" : "0",
                    "msg" : "start update user photo"
                }));
            } else {
                console.log("contact.syncUserPhoto end");
                Response.end(JSON.stringify({
                    "status" : "0",
                    "msg" : "no user update photo"
                }));
            }
			setSyncPhotoFlag();
        } else {
            console.log("contact.syncUserPhoto end");
            Response.end(JSON.stringify({
                "status" : "-1",
                "msg" : "has synced or happened error"
            }));
        }
    });
}

//同步员工照片
function syncUserPhoto(users,IF) {
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
    }, 30);
    for (var i in users) {
        queue.push(users[i]);
    }
    queue.drain = function() {
        console.log("sync user photo to mongodb");
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
            
			
			 baseUserModel.findOne({
                "PERNR": task.userId
            }, {
                "photoNewStatus": 1
            }, function(err, data) {
                if (!data.photoNewStatus || data.photoNewStatus == 0) {
                    //无自定义时
                    baseUserModel.update({
                        "PERNR": task.userId
                    }, {
                        "photoStatus": status,
                        "photoURL": url,
                        "photoURL2": url2,
                        "photoUpdateTime": task.photoDate
                    }, function(err) {
                        callback(err, "");
                    });
                }else{
					 callback(err, "");
				}
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

function setSyncPhotoFlag(){
	var currentDate = util.getDateStrFromTimes(new Date().getTime(), false);
	var redisCli = redis.createClient(global.redisPort, global.redisHost);
        redisCli.on("ready", function() {
            redisCli.select(contactUtil.contactConst.redisDB, function() {
                redisCli.set("syncUserPhoto", currentDate,function(err, data) {
                    redisCli.quit();
					console.log("set sync photo flag over");
                });
            });
        });
}

exports.Runner = run;

