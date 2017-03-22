var MEAP = require("meap");
var mongoClient = require("mongodb").MongoClient;

/**
 * 查询管理员的待审核或者已审核的会议室的数量
 * @authro donghua.wang
 * @date 2015年11月4日 13:26
 * */
function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type", "text/json;charset=utf-8");

    var arg = JSON.parse(Param.body.toString());
    var state = arg.state;
    var userId = arg.userId;
    var query = {};
    if (state == 0) {//未审核   1
        query = {
            needApply: 1,
            state: 1,
            checkUser: {
                $elemMatch: {
                    userId: userId
                }
            }
        };
    } else if (state == 1) {//已审核
        var beginTime = arg.beginTime;
        var endTime = arg.endTime;
        query = {
            needApply: 1,
            state: {
                $in: [2, 3, 5, 6]
            },
            checkUser: {
                $elemMatch: {
                    userId: userId
                }
            }
        };
        if (beginTime && endTime) {
            query.createTime = {
                $gte: beginTime,
                $lte: endTime
            }
        } else if (beginTime) {
            query.createTime = {
                gte: beginTime
            }
        } else if (endTime) {
            query.createTime = {
                $lte: endTime
            }
        }
    }

    mongoClient.connect(global.mongodbURL, function (err, db) {
        var coll = db.collection("meetbooks");
        coll.count(query, function (err, count) {
            db.close();

            if(err != null) {
                Response.end(JSON.stringify({
                    status: 1,
                    msg: "查询错误"
                }));
                return;
            }

            Response.end(JSON.stringify({
                status: 0,
                msg: "查询成功",
                count: count
            }));
        });
    });

}

exports.Runner = run;

