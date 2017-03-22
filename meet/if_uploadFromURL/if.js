var MEAP = require("meap");
var path = require("path");
var fs = require("fs");
var gm = require("gm");
var imageMagick = gm.subClass({
    imageMagick : true
});

function run(Param, Robot, Request, Response, IF) {
    //请求参数
   // var arg = JSON.parse(Param.body.toString());
    //图片地址
    //var url = arg.url;
    var url = "http://10.10.1.182:8888/uploads/1425451948304.jpg";
    //得到文件扩展名(以前的参数都是物理路径，不知道网络路径可以不，自己可以试试)
    var extname = path.extname(url);
    var times = new Date().getTime();
    //保存图片路径,该路径对应的是挂载的nginx路径，这样才可以通过http访问
    var filePath = "/opt/emm/uploads/" + times + extname;
    var option = {
        url : url,
        method : "GET",
        Stream : fs.createWriteStream(filePath)
    };
    MEAP.AJAX.Runner(option, function(err, res, data) {
        if (!err) {
            var commpressedFilePath = "/opt/emm/uploads/expressed_" + times + extname;
            var imgBuffer = imageMagick(filePath);
            //设置保存原始图片质量的百分比和设置宽度，高度自适应
            imgBuffer.quality(80).resize(136);
            imgBuffer.write(commpressedFilePath, function(err) {
               if(!err){
                    Response.end(JSON.stringify({
                        status:"0",
                        msg:"压缩图片成功",
                        url1:"http://10.10.1.182:8888/" + times + extname,
                        url2:"http://10.10.1.182:8888/expressed_" + times + extname
                    }));
               }else{
                    Response.end(JSON.stringify({
                        status:"-1",
                        msg:"压缩图片失败"
                    }));
               }
            });
        } else {
            Response.end(JSON.stringify({
                status:"-1",
                msg:"下载图片失败"
            }));
        }
    },Robot);
}

exports.Runner = run;


