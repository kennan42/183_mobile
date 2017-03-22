var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var SendSmsToInactiveUsersLogsSchema = new Schema({
    requestDate:String,
    requestTime:Number,//请求时刻
    arg:String,//请求参数
    invokeEasemobTime:Number,//调用环信时刻
    completeEasemobTime:Number,//环信调用结束时刻
    sendSmsTime:Number,//发送短信时刻
    sendSmsOption:String,
    completeSendSmsTime:Number,//完成发送短信时刻
    sendSmsResult:String,
    requestCostTime:Number,//请求耗时
    invokeEasemobCostTime:Number,//调用环信耗时
    handleDataCostTime:Number,//处理数据耗时
    sendSmsCostTime:Number//发送短信耗时
});



exports.SendSmsToInactiveUsersLogsSchema = SendSmsToInactiveUsersLogsSchema;
