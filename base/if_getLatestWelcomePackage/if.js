var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../BaseSchema.js");

// 获取最新欢迎页图片包信息
function run(Param, Robot, Request, Response, IF) {
    var db = mongoose.createConnection(global.mongodbURL);
    var BaseWelcomePackageModel = db.model("baseWelcomePackage", sm.BaseWelcomePackage);
    var time = new Date().getTime();  // 获取当前时间
    BaseWelcomePackageModel.findOne({
        "status": 0,
        "beginTime": {
            "$lt": time
        },
        "endTime": {
            "$gt": time
        }
    }).sort({
        "priority": -1,
        "id": -1
    }).exec(
        function (err, doc) {
            db.close();
            Response.setHeader("Content-type", "text/json;charset=utf-8");
            if (!err && doc != null) {
                Response.end(JSON.stringify({
                    "status": "0",
                    "msg": "查询成功",
                    "data": {
                        "id": doc.id,
                        "images": doc.images,
                        "skip": doc.skip,
                        "duration": doc.duration,
                        "enterType": doc.enterType
                    }
                }));
            } else {
                Response.end(JSON.stringify({
                    "status": "0",
                    "msg": "查询失败",
                    "data": ""
                }));
            }
        }
    );
}
exports.Runner = run;


                                

	

