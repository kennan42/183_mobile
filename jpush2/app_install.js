var mongoose = require("mongoose");
var Schema = mongoose.Schema;



//用户已安装子应用表 (app_install)
var installedAppSchema = new Schema({
    userId:String,
    appId:String,
    appName:String,
    receveMsg:Number,//1接收   0不接收  默认1
    createTime:Number,
    updateTime:Number
});

exports.installedAppSchema =installedAppSchema;