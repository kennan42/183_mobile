var MEAP = require("meap");
var taskSchema = require("../ToListSchema");
var mongoose = require("mongoose");

/**
 * 获取统一代办列表,按order排序
 *
 * @param Param
 * @param Robot
 * @param Request
 * @param Response
 * @param IF
 */
function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type", "text/json;charset=utf-8");

    var conn = mongoose.createConnection(global.mongodbURL);
    var taskItemModel = conn.model("base_task_item", taskSchema.taskItemSchema);
    taskItemModel.find({"status": 1}).sort({
        "order": 1
    }).exec(function (err, docs) {
        conn.close();

        if (err != null) {
            Response.end(JSON.stringify({
                status: "1",
                msg: "查询失败"
            }));
            return;
        }

        var result = [];
        for (var i in docs) {
            result.push({
                code: docs[i].code,
                name: docs[i].name,
                status: docs[i].status,
                order: docs[i].order,
                multi: docs[i].multi
            });
        }

        Response.end(JSON.stringify({
            status: "0",
            msg: "查询成功",
            data: result
        }));
    });
}

exports.Runner = run;