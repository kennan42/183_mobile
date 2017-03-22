var mongoose = require("mongoose");
var Schema = mongoose.Schema;



//代办排序

var WaitTaskSchema= new Schema({
     userId:String, //用户工号 
     order :[], //排序 数组
     updateTime:Number //创建时间
     
});



exports.WaitTaskSchema =WaitTaskSchema;