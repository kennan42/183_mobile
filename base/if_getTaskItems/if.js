var MEAP = require("meap");
var taskSchema = require("../BaseSchema.js");
var mongoose = require("mongoose");

/**
 * 获取统一代办列表
 * @author donghua.wang
 * @date 2015年11月6日 16:28
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("task.getTaskItems start");
    Response.setHeader("Content-Type","text/json;charset=utf-8");
    var conn = mongoose.createConnection(global.mongodbURL);
    var taskItemModel = conn.model("base_task_item", taskSchema.taskItemSchema);
    taskItemModel.find({"status":1}).sort({
        "order" : 1
    }).exec(function(err,docs) {
        conn.close();
        console.log("task.getTaskItems end");
        Response.end(JSON.stringify({
            "status":"0",
            "data":docs
        }));
    });
}

exports.Runner = run;

