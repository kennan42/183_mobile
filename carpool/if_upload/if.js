var MEAP = require("meap");
var fs = require("fs");
var path = require("path");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../carpoolSchema.js");
var async = require("async");
var gm = require("gm");
var imageMagick = gm.subClass({
    imageMagick : true
});


/**
* 上传图片接口
**/
function run(Param, Robot, Request, Response, IF) {
    var files = Param.files.file;
    var ext = path.extname(Param.files.file.name);
    var oldFileName = files.name;
    var newFileName = new Date().getTime() + ext;
    var newFilePath = "/opt/emm/uploads/carpool/" + newFileName;
    var fileSize = files.size;
    var is = fs.createReadStream(files.path);
    var os = fs.createWriteStream(newFilePath);
    is.pipe(os);

    is.on('error', function(err) {
        console.log("25 line--->",err);
        Response.end(JSON.stringify({
            status : -1,
            msg : '图片上传失败'
        }));
        return;
    });

    is.on('end', function() {
        fs.unlinkSync(files.path);
        //压缩图片
        async.series([
        function(callback) {
            var compressedImagePath = "/opt/emm/uploads/carpool/compressed_" + newFileName;
            var compressedImageName = "uploads/carpool/compressed_" + newFileName;
            var imgBuffer = imageMagick(newFilePath);
            imgBuffer.quality(80).resize(136);
            imgBuffer.write(compressedImagePath, function(err) {
                callback(err, compressedImageName);
            });
        },
        function(callback) {
            var compressedImagePath = "/opt/emm/uploads/carpool/compressed2_" + newFileName;
            var compressedImageName = "uploads/carpool/compressed2_" + newFileName;
            var imgBuffer = imageMagick(newFilePath);
            imgBuffer.quality(80);
            imgBuffer.write(compressedImagePath, function(err) {
                callback(err, compressedImageName);
            });
        }], function(err, data) {
            if (!err) {
                //保存图片信息至数据库
                var path1 = data[0]; //压缩后的小尺寸图片
                var path2 = data[1];//压缩后的原始大小图片
                var db = mongoose.createConnection(global.mongodbURL);
                var CarpoolAttachmentModel = db.model("CarpoolAttachment", sm.CarpoolAttachmentSchema);
                var carpoolAttachmentEntit = new CarpoolAttachmentModel({
                    userId : Param.params.userId,
					company :Param.params.company,
                    fileName : newFileName,
                    orinalFileName : oldFileName,
                    fileSize : fileSize,
                    filePath : global.nginxURL + path1,
                    filePath2 : global.nginxURL + path2,
                    createdAt : new Date().getTime()
                });
                carpoolAttachmentEntit.save(function(err, data) {
                    db.close();
                    if (!err) {
                        Response.end(JSON.stringify({
                            status : "0",
                            fileId : data._id,
                            fileURL : data.filePath,
                            fileURL2 : data.filePath2
                        }));
                    } else {
                        Response.end(JSON.stringify({
                            status : -1,
                            msg : '保存图片信息失败'
                        }));
                    }
                });
            } else {
                Response.end(JSON.stringify({
                    status : -1,
                    msg : '图片上传失败'
                }));
            }
             fs.unlinkSync(newFilePath);
        });
    });
}

exports.Runner = run;
