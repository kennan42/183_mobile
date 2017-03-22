var mongoose = require("mongoose");
var Schema = mongoose.Schema;


var VcodeLogSchema = new Schema({
    phoneNumber:String,  //手机号
    vcode:String,    //验证码 
    sendTime:Number ,  //发送时间 
    isUsed:Number  //是否使用，0未使用 1使用
    
    
});

exports.VcodeLogSchema=VcodeLogSchema;