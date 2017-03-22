var mongoose = require("mongoose");
var Schema = mongoose.Schema;

/**
 *app版本信息 
 */
var appversionSchema =new Schema({
    versionid:String,//版本号
    versionName:String,//版本名称
    appName:String,//app名称
    updateMsg:String,//版本升级说明
    uploadDate:Number,//更新时间
    systemtype:String//app是android还是ios
});


exports.appversionSchema = appversionSchema;