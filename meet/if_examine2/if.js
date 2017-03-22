var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");
var async = require("async");

function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-type", "text/json;charset=utf-8");
    var conn = mongoose.createConnection(global.mongodbURL);
    var meetBookModel = conn.model("meetBook", sm.MeetBookSchema);

    var arg = JSON.parse(Param.body.toString());
    var state = arg.state;
    var userId = arg.userId;
    var pageSize = parseInt(arg.pageSize, 10);
    var pageNum = parseInt(arg.pageNum, 10);
    var beginTime = parseInt(arg.beginTime, 10);
    var endTime = parseInt(arg.endTime, 10);

    if (!(state && userId) || isNaN(pageSize) || isNaN(pageNum) || (isNaN(beginTime) && isNaN(endTime))) {
        Response.end(JSON.stringify({
            status: "-1",
            msg: "参数传递错误"
        }));
        return
    }

    var skip = (pageNum - 1) * pageSize;
    if (skip < 0) {
        skip = 0
    }

    var query = [];
    if (state == 0) {//未审核   1
        query = [
            {
                $match: {
                    needApply: 1,
                    state: 1,
                    "checkUser.userId": userId
                }
            }, {
                $sort: {
                    userName2: 1,
                    userId: 1,
                    createTime: -1
                }
            }
        ];
    } else if (state == 1) {//已审核
        query = [
            {
                $match: {
                    needApply: 1,
                    state: {
                        $in: [2, 3, 5, 6]
                    },
                    "checkUser.userId": arg.userId
                }
            }, {
                $sort: {
                    createTime: -1
                }
            }
        ];
    }

    if (beginTime) {
        if (!query[0]["$match"].createTime) {
            query[0]["$match"].createTime = {}
        }
        query[0]["$match"].createTime["$gte"] = beginTime;
    }
    if (endTime) {
        if (!query[0]["$match"].createTime) {
            query[0]["$match"].createTime = {}
        }
        query[0]["$match"].createTime["$lte"] = endTime;
    }
    query.push({
        $skip: skip
    });
    query.push({
        $limit: pageSize
    });

    async.parallel([
        function (cb) {
            meetBookModel.count(query[0]["$match"], function (err, count) {
                if (err) {
                    cb(err, {});
                } else {
                    cb(null, count);
                }

            });
        },
        function (cb) {
            meetBookModel.aggregate(query, function (err, res) {
                if (err) {
                    cb(err, {});
                } else {
                    cb(null, res);
                }
            });
        }
    ], function (err, data) {
        conn.close();
        if (err) {
            Response.end(JSON.stringify({
                status: 1,
                msg: "查询失败"
            }));
        } else {
            Response.end(JSON.stringify({
                status: 0,
                msg: "查询成功",
                data: {
                    list: data[1],
                    count: data[0]
                }
            }));
        }
    });


}

exports.Runner = run;


                                

	

