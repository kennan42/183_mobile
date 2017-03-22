var MEAP = require("meap");
var fs = require("fs");
var path = require("path");
/**
 *上传席位卡
 *  */
function run(Param, Robot, Request, Response, IF) {
    var files = Param.files.file;
    var fileName = files.name;
    var ext = path.extname(Param.files.file.name);
    var times = new Date().getTime();
    var newFileName = times + ext;
    var newFilePath ="/opt/emm/uploads/meet/" + newFileName;
    var is = fs.createReadStream(files.path);
    var os = fs.createWriteStream(newFilePath);
    is.pipe(os);
    Response.setHeader("Content-type","text/json;charset=utf-8");
    is.on('error', function() {
        Response.end(JSON.stringify({
            status : -1,
            msg : '席位卡上传失败'
        }));
        return;
    });
    is.on('end', function() {
        Response.end(JSON.stringify({
            status : 0,
            msg : '席位卡上传成功',
            seatCard:global.nginxURL + "uploads/meet/" + newFileName
        }));
        return;
    });
}

exports.Runner = run;
