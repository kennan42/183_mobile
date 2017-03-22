var mongoose = require("mongoose");
var Schema = mongoose.Schema;

//记录页面访问量(analy_page_visit_log)
var AnalyPageVisitLogSchema = new Schema({
    userId: String,//用户id
    type: String,//报表类型，比如 HR
    module: String,//功能模块名称，比如 OnJob
    page: String,//访问的页面名称，比如 index.html
    startTime: Number,//进入页面时间
    endTime: Number,//离开页面时间,进入页面则存0
    stayTime: Number,//停留页面时间，进入页面存0
    createTime: Number//创建时间
});

//个人加班时长统计 analy_overtime_log
var AnalyOvertimeLogSchema = new Schema({
    userId:String,
    startTime:Number,//加班开始时间
    endTime:Number,//加班结束时间
    time:Number,//加班时长
    createTime:Number//建立时间
});

//nginx app的下载记录(analy_app_download)
var AnalyAppDownloadSchema = new Schema({
    version:String,
    platform:String,//平台：[android,ios]
    createTime:String
});

//记录用户的第一次登录(analy_first_login)
var AnalyFirstLoginSchema = new Schema({
    userId:String,
    loginDateStr:String,
    createTime:Number
});

//记录用户的最后一次登录(analy_last_login)
var AnalyLastLoginSchema = new Schema({
    userId:String,
    loginDateStr:String,
    createTime:Number
});

//记录用户的登录日志(analy_login)
var AnalyLoginSchema = new Schema({
    userId:String,
    platform:String,//平台：[android,ios]
    version:String,//app版本
    loginType:String,//登录类型 [login,unlock]
    terminal:Object,//终端信息
    createTime:Number
});

//活跃率(analy_active_rate)
var AnalyActiveRateSchema = new Schema({
    activeRate:Number,//活跃率
	activeCount:Number,//活跃用户数
    activeRateType:String,//月活跃率，周活跃率[month,week]
    startTime:String,//统计开始时间
    endTime:String,//统计结束时间
    createTime:Number
});

//安装率(analy_install_rate)
var AnalyInstallRateSchema = new Schema({
    installRate:Number,//安装率
	installCount:Number,//安装数量
    installRateType:String,//月安装率，周安装率[month,week]
    startTime:String,//统计开始时间
    endTime:String,//统计结束时间
    createTime:Number
});

//子应用访问记录(analy_subapp_access_log)
var AnalySubappAccessLogSchema = new Schema({
    appId:String,
    appName:String,
    userId:String,
    createTime:Number
});

//子应用访问率/二跳率(analy_subapp_access_rate)
var AnalySubappAccessRateSchema = new Schema({
    appId:String,
    appName:String,
    accessRate:Number,//访问率
	accessCount:Number,//访问数量
    accessRateType:String,//统计类型 天，周，月[day,week,month]
    startTime:String,//统计开始时间
    endTime:String,//统计结束时间
    createTime:Number
});

//子应用总的访问率(analy_subapp_total_access_rate)
var AnalySubappTotalAccessRateSchema = new Schema({
    accessRate:Number,//访问率
	accessCount:Number,//访问数量
    accessRateType:String,//统计类型 天，周，月[day,week,month]
    startTime:String,//统计开始时间
    endTime:String,//统计结束时间
    createTime:Number
});

//睡眠用户(analy_sleep_user)
var AnalySleepUserSchema = new Schema({
	"userId":String,
	"userName":String,
	"sleepStartTime":Number,
	"sleepStartTimeStr":String,
	"createTime":Number
});


exports.AnalyPageVisitLogSchema = AnalyPageVisitLogSchema;
exports.AnalyOvertimeLogSchema = AnalyOvertimeLogSchema;
exports.AnalyAppDownloadSchema = AnalyAppDownloadSchema;
exports.AnalyFirstLoginSchema = AnalyFirstLoginSchema;
exports.AnalyLastLoginSchema = AnalyLastLoginSchema;
exports.AnalyLoginSchema = AnalyLoginSchema;
exports.AnalyInstallRateSchema = AnalyInstallRateSchema;
exports.AnalySubappAccessLogSchema = AnalySubappAccessLogSchema;
exports.AnalySubappAccessRateSchema = AnalySubappAccessRateSchema;
exports.AnalySubappTotalAccessRateSchema = AnalySubappTotalAccessRateSchema;
exports.AnalyActiveRateSchema = AnalyActiveRateSchema;
exports.AnalySleepUserSchema = AnalySleepUserSchema;