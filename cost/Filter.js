//var mongoClient = require("mongodb").MongoClient;
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var downtimeNoticeSchema = new Schema({
    title: {type: String, trim: true}, // 公告标题
    content: {type: String, trim: true}, // 公告内容
    interfaceArr: {type: Array, trim: true}, // 公告接口列表 [{_id:xxx,description:xxx,name:xxx},..]
    beginTime: {type: Number, trim: true}, // 开始时间戳
    endTime: {type: Number, trim: true}, // 结束时间戳
    contactArr: {type: Array, trim: true}, // 联系人列表 [{name:xxx,phone:xxx},...]
    createTime: Number // 创建时间
});

function run(Param, Robot, Request, Response, IF, cb) {
    Response.setHeader("Content-Type", "text/json;charset=utf-8");

    var conn = mongoose.createConnection(global.mongodbURL, {replset: {poolSize: 1}});
    var downtimeNoticeModel = conn.model("base_downtime_notice", downtimeNoticeSchema);
    var type = Param.type;
    var unixTime = new Date().getTime();
    downtimeNoticeModel.aggregate([
            {
                $match: {
                    beginTime: {
                        $lt: unixTime
                    },
                    endTime: {
                        $gt: unixTime
                    },
                    "interfaceArr.name": type
                }
            }
        ],
        function (err, res) {
            conn.close();
            if (err == null) {
                if (res.length > 0) {
                    Response.setHeader("Content-Type", "text/json;charset=utf-8");
                    Response.end(JSON.stringify({
                        status: -9999,
                        msg: "已停机",
                        data: res[0]
                    }));
                    return;
                } else {
                    cb(0);
                }
            } else {
                db.close();
                Response.end(JSON.stringify({
                    "status": 1,
                    "msg": "停机公告查询出错"
                }));
            }
        }
    );

}

exports.Runner = run;
