var MEAP = require("meap");
var async = require("async");
var util = require("../util.js");

/**
 * 定时器，每隔固定时间(5分钟)处理通用的逻辑
 * @author donghua.wang
 * @date 2015年05月19日 13:59
 * */
function run(Param, Robot, Request, Response, IF) {
    Response.end("base task");
}

exports.Runner = run;

