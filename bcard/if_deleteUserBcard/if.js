var MEAP = require("meap");
var fs = require("fs");
var mongoose = require("mongoose");
var async = require("async");
var bcardSchema = require("../bcardSchema.js");

/**
 * 删除个人名片
 * @author donghua.wang
 * @date 2015年12月9日 14:26
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("bcard.deleteUserBcard start");
    Response.setHeader("Content-Type", "text/json;charset=utf-8");
    try {
        var arg = JSON.parse(Param.body.toString());
        var userBcardId = arg.userBcardId;
        var conn = mongoose.createConnection(global.mongodbURL);
        var bcardUserModel = conn.model("bcard_user", bcardSchema.bcardUserSchema);
        bcardUserModel.findById(userBcardId, function(err, doc) {
            if (!err && doc != null) {
                async.parallel([
                //删除个人名片
                function(cb) {
                    bcardUserModel.remove({
                        "_id" : userBcardId
                    }, function(err) {
                        conn.close();
                        cb(err, doc);
                    });
                }], function(err, data) {
                    console.log("bcard.deleteUserBcard end");
                    if (!err) {
                        Response.end(JSON.stringify({
                            "status" : "0",
                            "msg" : "删除名片成功"
                        }));
						var userBcard = data[0];
						var bcardPath = userBcard.bcardPath;
						var bcardBackgroudPath = userBcard.bcardBackgroudPath;
						var vcardPath = userBcard.vcardPath;
						fs.unlinkSync(bcardPath);
						if(bcardBackgroudPath != ""){
							fs.unlinkSync(bcardBackgroudPath);
						}
						fs.unlinkSync(vcardPath);
                    } else {
                        Response.end(JSON.stringify({
                            "status" : "-1",
                            "msg" : "删除名片失败"
                        }));
                    }
                });
            } else {
                conn.close();
                console.log("bcard.deleteUserBcard end");
                Response.end(JSON.stringify({
                    "status" : "-1",
                    "msg" : "查询名片失败"
                }));
            }
        });
    } catch(e) {
        console.log("bcard.deleteUserBcard error", e);
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "删除名片失败"
        }));
    }
}

exports.Runner = run;

