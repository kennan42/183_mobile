var mongoose = require("mongoose");
var Schema = mongoose.Schema;

//统一待办项(base_task_item)
var taskItemSchema = new Schema({
    code:String,
    name:String,
    status:Number,//1有效         0失效
    order:Number,//显示顺序
    multi:Number//是否可以多选
});

exports.taskItemSchema=taskItemSchema;