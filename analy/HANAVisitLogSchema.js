var mongoose = require("mongoose");
var Schema = mongoose.Schema;

//记录页面访问量(analy_page_visit_log)
var HANAVisitLogSchema = new Schema({
    type: String,
    module: String,
    HANAInit: Number,
    HANAOpen: Number,
    HANATimeQueryBegin: Number,
    HANATimeQueryEnd: Number,
    HANAQueryTime: Number,
    params: String,
    createTime: Number
});
exports.HANAVisitLogSchema = HANAVisitLogSchema;