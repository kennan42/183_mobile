var mongoose = require("mongoose");
var Schema = mongoose.Schema;

//发起支付请求
var CarpoolToPaySchema = new Schema({
    userId : String, //创建人id
    userName : String, //创建人name
    company : String, //创建人所属公司：cttq

    toUserId : String, //转给人id
    toUserName : String, //转给人name
    toCompany : String, //转给人公司
    amount : Number, //订单总金额, 单位为对应币种的最小货币单位，例如：人民币为分（如订单总金额为 1 元，此处请填 100）
    channel : String, //渠道：
    subject : String, //商品标题
    body : String, //商品描述
    order_no : String, //商户订单号，适配每个渠道对此参数的要求，必须在商户系统内唯一
    currency : String, //currency  :cny
    client_ip : String, //client_ip
    chargeId : String, //chargeId
    status : Number, //发起支付请求的状态  0：开始发起， 1：支付成功    2：支付失败
    creatTime : Number, //创建时间
    updateTime : Number

});

//微信的openId保存表Account
var WxAccountSchema = new Schema({
    wxOpenId : String, //微信openId,加密后的
    userId : String,
    userName : String,
    company : String,
    createTime : Number,
    updateTime : Number
});

//企业支付转账记录
var TransferLogsSchema = new Schema({
    toUserId : String, //转给人
    toUserName : String, //name
    toCompany : String, //公司代码
    amount : Number, //金额
    channel : String, //渠道
    wxOpenId : String, //微信openid
    chargeId : String, //chargeId
    transferId : String, //transferId
    order_no : String, //transfer的 order_no  企业转账使用的商户内部订单号
    status : Number, //转账记录状态   0：开始转账      1：转账成功   2：转账失败
    createTime : Number, //创建时间
    updateTime : Number
});

//企业转账 webhooks记录
var TransEventLogsSchema = new Schema({
    eventId : String,
    transferId : String,
    eventObject : String,
    createTime : Number //创建时间
});

//支付成webhooks记录
var PayEventLogsSchema = new Schema({
    eventId : String,
    chargerId : String,
    eventObject : String,
    createTime : Number //创建时间
});



exports.PayEventLogsSchema =PayEventLogsSchema;
exports.TransEventLogsSchema = TransEventLogsSchema;
exports.TransferLogsSchema = TransferLogsSchema;
exports.WxAccountSchema = WxAccountSchema;
exports.CarpoolToPaySchema = CarpoolToPaySchema;

