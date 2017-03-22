/**
 *名片(business card)数据模型设计
 * @authro donghua.wang
 * @date 2015年12月3日 14:11
 *  */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

//名片模版(bcard_template)
/*
 var bcardTemplateSchema = new Schema({
 "templateEnName" : String, //模版英文名称
 "templateCnName" : String, //模版中文名称
 "templateURL" : String, //模版URL
 "templateDemoURL":String,//模版样板
 "templatePath":String,//模版物理路径
 "templateBackgroundURL":String,
 "templateStatus" : Number, //模版状态 1有效  0失效
 "templateOrder" : Number, //模版顺序
 "selectedMaxDisplayCount":Number,//可选项最多显示数量
 "startLocConfig":Object,//下方初始位置配置
 "companyConfig":Object,//公司配置
 "itemConfig" : Object,//模版配置信息，用户具体配置名片需要显示的信息，
 "backgroundConfig":Object//名片模版后台配置
 });*/

var bcardTemplateSchema = new Schema({
    "templateEnName" : String, //模版英文名称
    "templateCnName" : String, //模版中文名称
    "templateURL" : String, //模版URL
    "templateDemoURL" : String, //模版样板
    "templatePath" : String, //模版物理路径
    "templateBackgroundURL" : String,
    "templateStatus" : Number, //模版状态 1有效  0失效
    "templateOrder" : Number, //模版顺序
    "selectedMaxDisplayCount" : Number, //可选项最多显示数量
    "startLocationConfig" : Object, //下方初始位置配置
    "companyConfig" : Object, //公司配置
    "backgroundConfig" : Object, //名片模版后台配置
    "qrCodeConfig" : Object, //二维码配置
    "fontConfig" : Object,
    "align" : String,
    "requiredItems" : [],
    "selectedItems" : [],
    "open" : String//外部员工是否可以使用   1可以  0不可以
});

var bcardOrderSchema = new Schema({
    "order" : []
});

//个人名片(bcard_user)
var bcardUserSchema = new Schema({
    bcardName : String, //名片名称
    userId : String, //用户id
    userName : Object, //用户名
    job : Object, //岗位
    dept : Object, //部门
    company : Object, //公司
    enName : Object, //英文名称
    mobileNumber : Object, //手机
    call : Object, //电话
    companyAddress : Object, //公司地址
    email : Object, //邮箱
    QQ : Object, //QQ
    weixin : Object, //微信
    companyEmail : Object, //公司邮箱
    companyPage : Object, //公司主页
    fax : Object, //传真
    postcode : Object, //邮编
    servicePhone : Object, //服务电话
    templateId : String, //模版名称
    bcardURL : String,
    bcardPath : String,
    bcardBackgroudURL : String, //名片背面
    bcardBackgroudPath : String,
    contactErweimaURL : String,
    contactErweimaPath : String,
    qrCodeURL : String,
    bcardErweimaURL : String,
    uuid : String, //用于扫描二维码
	clientType:String,//客户端类型[weixin,tianxin]
    creatTime : Number, //建立时间
    updateTime : Number//更新时间
});

//微信名片功能使用日志(bcard_weixin_func_use_log)
var bcardWeinxinFuncUseLogSchema = new Schema({
    module : String,//功能
    subModule : String,//子功能
    subModuleDesc : String,//子功能描述
    userId : String,//用户id
    createTime : Number//建立时间
});

//微信名片模版浏览日志
var bcardWeixinTemplateUseLogSchema = new Schema({
    
});

//微信名片行为分析(analy_weixin_bcard)
var analyWeinBcardSchema = new Schema({
    userId:String,
    page:String,
    action:String,
    createTime:Number
});

//app名片行为分析(analy_app_bcard)
var analyAppBcardSchema = new Schema({
    userId:String,
    action:String,
    createTime:String
});

//微信名片页面停留时间(analy_weixin_bcard_pagevisit_time)
var analyWeixinBcardPageVisitTimeSchema = new Schema({
    userId:String,
    page:String,
    startTime:Number,
    endTime:Number,
    stayTime:Number,
    createTime:Number
});

exports.bcardTemplateSchema = bcardTemplateSchema;
exports.bcardUserSchema = bcardUserSchema;
exports.bcardOrderSchema = bcardOrderSchema;
exports.bcardWeinxinFuncUseLogSchema = bcardWeinxinFuncUseLogSchema;
exports.bcardWeixinTemplateUseLogSchema = bcardWeixinTemplateUseLogSchema;
exports.analyWeinBcardSchema = analyWeinBcardSchema;
exports.analyAppBcardSchema = analyAppBcardSchema;
exports.analyWeixinBcardPageVisitTimeSchema = analyWeixinBcardPageVisitTimeSchema;
