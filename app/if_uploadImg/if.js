var MEAP = require("meap");
var fs = require("fs");
var path = require("path");
var async = require("async");
var gm = require("gm");
var imageMagick = gm.subClass({
    imageMagick : true
});

function run(Param, Robot, Request, Response, IF) {
    var file = Param.files.file;
    var ext = path.extname(file.name);
    var newFileName = new Date().getTime() + ext;
    var newFilePath = "/opt/emm/uploads/app/" + newFileName;
    var is = fs.createReadStream(file.path);
    var os = fs.createWriteStream(newFilePath);
    is.pipe(os);

    is.on('error', function(err) {
        console.log("25 line--->", err);
        Response.end(JSON.stringify({
            status : -1,
            msg : '图片上传失败'
        }));
        return;
    });

    is.on('end', function() {
        //压缩图片
        var compressedImagePath = "/opt/emm/uploads/app/compressed_" + newFileName;
        var imgBuffer = imageMagick(newFilePath);
        imgBuffer.quality(80);
        imgBuffer.write(compressedImagePath, function(err) {
            var fileURL = global.nginxURL + "uploads/app/compressed_" + newFileName;
            Response.end(JSON.stringify({
                "status" : "0",
                "url" : fileURL,
                "msg" : "图片上传成功"
            }));
            fs.unlinkSync(file.path);
            fs.unlink(newFilePath, function(err) {
                if (err) {
                    console.log("remove file err", err);
                }
            });
        });
    });
}

exports.Runner = run;
