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
    var newFileName = new Date().getTime() + ext;
    var newFilePath = "/opt/emm/uploads/" + newFileName;
    var fileSize = files.size;
    var is = fs.createReadStream(files.path);
    var os = fs.createWriteStream(newFilePath);
    is.pipe(os);
    is.on('error', function() {
        Response.end(JSON.stringify({
            status : -1,
            msg : '图片上传失败'
        }));
        return;
    });
    is.on('end', function() {
        fs.unlinkSync(files.path);
        // start save file to mongodb
        var db = mongoose.createConnection(global.mongodbURL);
        var baseFestivalModel = db.model("baseFestival", sm.BaseFestivalSchema);
        var imageURL = global.nginxURL + "uploads/" + newFileName;
        baseFestivalModel.update({
            appId : "tianxin"
        }, {
            imageURL : imageURL,
            expireDate : expireDate,
            detail:detail,
            createdAt:new Date().getTime()
        }, {
            upsert : true,
            multi:false
        }, function(err) {
            db.close();
            Response.setHeader("Content-type","text/json;charset=utf-8");
            if (!err) {
                Response.end(JSON.stringify({
                    status : "0",
                    msg : "保存图片信息成功",
                    imageURL : imageURL
                }));
            } else {
                Response.end(JSON.stringify({
                    status : "-1",
                    msg : "保存图片信息失败"
                }));
            }

        });
    });
}

exports.Runner = run;
