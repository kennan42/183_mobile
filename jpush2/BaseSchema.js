var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var BaseFestivalSchema = new Schema({
    appId:String,
    imageURL:String,
    expireDate:Number,
    createdAt:Number
});

var BasePushMessageLogSchema = new Schema({
    appId:String,//应用id
    userId:String,//用户id
    title:String,//标题
    body:String,//内容
    pushTime:Number,//推送时间
    readStatus:Number,//阅读状态  1已读   0未读
    module:String,
    subModule:String,
    type:String//message   remind   func 
});

//用户调用webservice日志（base_webservice_invoke_logs）
var baseWebserviceInvokeLogSchema = new Schema({
    userId:String,//调用用户
    input:Object,//入参
    output:Object,//出参
    createTime:String//调用时间
});

//欢迎页图片包
var BaseWelcomePackage = new Schema({
    appId:String,  //appID用于识别应用
    id:Number,  //自增id，100000开始；100000为默认
    images:Array,  //欢迎页图片的URL
    thumbnails:Array,  //欢迎页图片缩略图的URL
    description:String, //图片包描述
    status:Number,  //图片包状态，0表示启用1表示停用
    beginTime:Number,  //生效日期，Unix时间戳单位为ms
    endTime:Number,  //失效日期，Unix时间戳单位为ms
    priority:Number,  //优先级，整数，范围1-9，1最低，9最高；id为100000的图片优先级为0，不可修改
    skip:Number,  //是否允许跳过，0表示允许1表示不允许
    duration:Number,  //显示时长，整数，单位为s；单页面时用户可设置显示时长，多页面不存在请传-1
    createTime:Number,  //创建日期，，Unix时间戳单位为ms
    userId:String,  //创建者的用户名
    enterType: Number // 进入方式
});

var BaseActiveUserSchema = new Schema({
    userId:String,
    appId:String,
    activeDate:String,
    createTime:Number
});

//操作日志
var BaseOpLogSchema=new Schema({
    opType:String ,//i:增加，u:修改，d:删除
    opArg:{},//请求参数前端传过来的
    opDocument:String,//操作文档，操作的哪张表
    userId:String,//操作id
    userName:String,//操作人姓名
    updateTime:String//操作日期
});

exports.BaseFestivalSchema = BaseFestivalSchema;
exports.BasePushMessageLogSchema = BasePushMessageLogSchema;
exports.BaseWelcomePackage = BaseWelcomePackage;
exports.BaseActiveUserSchema = BaseActiveUserSchema;
exports.BaseOpLogSchema = BaseOpLogSchema;
exports.baseWebserviceInvokeLogSchema = baseWebserviceInvokeLogSchema;