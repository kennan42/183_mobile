var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var BasePushMessageLogSchema = new Schema({

    userId : String, //用户id
    title : String, //标题
    content : String, //内容
    pushTime : Number, //推送时间
    msg_id : Number, //推送返回结果msg_id
    status : String,
    error : Object,
    module : String,   //
    uid : String,
    readStatus:Number,   //阅读状态
    subModule:String
    
    
});

var MessageSchema = new Schema({
    msgType : String,
    content : String,
    userList : Array,
    status : Number

});

var msgLogSchema = new Schema({
    content : String,
    uid : String,
    status : Number,
    msgType : String

});


//消息推送开关状态
var  pushMsgStatusSchema =new Schema({
      userId :String,
      msgType:String,
      status:Number,
      updateTime:Number
      
});



//用户消息推送总开关(app_user_msgpush_status)
var appUserMsgPushStatusSchema = new Schema({
    userId:String,
    status:Number,//1接收消息  0不接收消息
    updateTime:Number
});

//用户接收消息推送模块(app_user_message_module)
var appUserMessageModuleSchema = new Schema({
    userId:String,
    moduleCode:String,
    status:Number,//1接收消息  0不接收消息
    updateTime:Number
});



exports.appUserMessageModuleSchema =appUserMessageModuleSchema;
exports.pushMsgStatusSchema =pushMsgStatusSchema;
exports.msgLogSchema = msgLogSchema;

exports.appUserMsgPushStatusSchema=appUserMsgPushStatusSchema;

exports.MessageSchema = MessageSchema;
exports.BasePushMessageLogSchema = BasePushMessageLogSchema; 