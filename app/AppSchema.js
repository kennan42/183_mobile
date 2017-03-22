var mongoose = require("mongoose");
var Schema = mongoose.Schema;

//子应用安装日志(app_install_logs)
var appInstallLogSchema = new Schema({
    userId:String,
    appId:String,
    appName:String,
    appVersion:String,
    opType:Number,//操作类型 1安装  2删除 3更新
    createTime:Number//操作时间
});

//用户已安装子应用表 (app_install)
var installedAppSchema = new Schema({
    userId:String,
    appId:String,
    appName:String,
    appVersion:String,
    receveMsg:Number,//1接收   0不接收  默认1
    createTime:Number,
    updateTime:Number
});

//消息模块与appId的映射关系 (app_message_push_modules)
var appMsgPushModuleSchema = new Schema({
    appId:String,
    msgModule:String,
    status:Number//1推送 0不推送  用于全局配置是否进行消息推送
});

//记录页面访问量(app_visit_page_log)
var appVisitPageLogSchema = new Schema({
    userId:String,//用户id
    userName:String,
    sex:String,
    age:Number,
    dept:String,
    deptName:String,
    plans:String,//职位
    plstx:String,//职位名称
    stell:String,//职务
    stltx:String,//职务名称
    module:String,//功能模块名称,
    subModule:String,//功能子模块
    page:String,//访问的页面名称
    startTime:Number,//进入页面时间
    endTime:Number,//离开页面时间,进入页面则存0
    stayTime:Number,//停留页面时间，进入页面存0
    createTime:Number//创建时间
});

//app功能访问记录(app_func_uselog)
var appFuncUseLogSchema = new Schema({
    userId:String,
    userName:String,
    sex:Number,
    age:Number,
    dept:String,
    deptName:String,
    plans:String,//职位
    plstx:String,//职位名称
    stell:String,//职务
    stltx:String,//职务名称
    module:String,//功能模块
    subModule:String,//功能子模块
    createTime:Number,//建立时间
    times:Number//计数,默认-1,大多数记录无需传
});

//极光注册(app_jpush_register_log)
var jpushRegisterLogSchema = new Schema({
    alias:String,//极光注册别名
    platform:Number,//平台类型 1:安卓     0:IOS
    createTime:String//注册时间
});

//app意见反馈(app_opinion)
var appOpinionSchema = new Schema({
    userId:String,
    userName:String,
    opinion:String,
    imgs:[],//图片数组
    status:Number,//0未回复  1已回复
    readStatus:Number,//回复是否已读  0未读  1已读
    reply:String,//回复内容
    replyImgs:[],//回复的图片
    replyUserId:String,
    createTime:Number,
    replyTime:Number,//回复时间
    readTime:Number//读回复信息时间
});

//app消息模块,针对天信标准版（app_message_module）
var appMessageModuleSchema = new Schema({
    moduleCode:String,
    moduleName:String,
    icon:String
});

//用户接收消息推送模块(app_user_message_module)
var appUserMessageModuleSchema = new Schema({
    userId:String,
    moduleCode:String,
    status:Number,//1接收消息  0不接收消息
    updateTime:Number
});

//用户消息推送总开关(app_user_msgpush_status)
var appUserMsgPushStatusSchema = new Schema({
    userId:String,
    status:Number,//1接收消息  0不接收消息
    updateTime:Number
});

exports.appInstallLogSchema = appInstallLogSchema;
exports.installedAppSchema = installedAppSchema;
exports.appMsgPushModuleSchema = appMsgPushModuleSchema;
exports.appVisitPageLogSchema = appVisitPageLogSchema;
exports.appFuncUseLogSchema = appFuncUseLogSchema;
exports.jpushRegisterLogSchema = jpushRegisterLogSchema;
exports.appOpinionSchema = appOpinionSchema;
exports.appMessageModuleSchema = appMessageModuleSchema;
exports.appUserMessageModuleSchema = appUserMessageModuleSchema;
exports.appUserMsgPushStatusSchema = appUserMsgPushStatusSchema;
