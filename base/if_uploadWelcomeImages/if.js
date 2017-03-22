var MEAP = require("meap");
var fs = require("fs");
var path = require("path");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../BaseSchema.js");

function run(Param, Robot, Request, Response, IF) {
  var expireDate = parseInt(Param.params.expireDate);
  var detail = Param.params.detail;
  var files = Param.files.file;
  var ext = path.extname(Param.files.file.name);

  var oldFileName = files.name;

  if(!valiedateImageType(path.extname(oldFileName))){
    Response.setHeader("Content-type", "text/json;charset=utf-8");
    Response.end(JSON.stringify({
      status:"1",
      msg:"图片格式错误"
    }));
    return;
  }

  var newFileName = new Date().getTime() + ext;
  var newFilePath = "/opt/emm/uploads/" + newFileName;
  //var newFilePath = "F:\\demo\\" + newFileName;
  var fileSize = files.size;
  var is = fs.createReadStream(files.path);
  var os = fs.createWriteStream(newFilePath);
  is.pipe(os);
  is.on('error', function () {
    Response.setHeader("Content-type", "text/json;charset=utf-8");
    Response.end(JSON.stringify({
      status: 1,
      msg: '图片上传失败'
    }));
    return;
  });
  is.on('end', function () {
    fs.unlinkSync(files.path);
    var imageURL = global.nginxURL + "uploads/" + newFileName;
    Response.setHeader("Content-type", "text/json;charset=utf-8");
    Response.end(JSON.stringify({
      status: "0",
      msg: "保存图片信息成功",
      data: {
        image: imageURL,
        thumbnail: imageURL
      }
    }));
  });
}
/**
 * 检查文件类型是否合法
 * @param upperFileName
 * @returns {boolean}
 */
function valiedateImageType(upperFileName){
  upperFileName = upperFileName.toUpperCase();
  var imageTypes = [".BMP",".JPEG",".GIF",".PNG",".JPG"];
  for(var i in imageTypes ){
    if(imageTypes[i] == upperFileName){
      return true;
    }
  }
  return false;
}
exports.Runner = run;
