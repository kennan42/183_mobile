
var API_KEY = "sk_test_XzTiTOHezzrPSaPafD1uHev1";
var APP_ID = "app_0OijzHTunPCOnfLW";

var MEAP = require("meap");
var crypto = require('crypto');
var pingpp = require('pingpp')(API_KEY);

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../CarpoolPaySchema.js");

var amount;
var channel;
var subject;
var body;
var userId;
var userName;
var company;
var toUserId;
var toUserName;
var toCompany;
var order_no;
var client_ip;



/**
 * 发起支付请求，返回charge，同时保存发起log
 * 作者：xialin
 * 时间：20160425
 */

function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type", "text/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    amount = arg.amount;
    channel = arg.channel;

    subject = arg.subject;//商品的标题
    body = arg.body;//商品的描述信息
    userId = arg.userId;//创建人id
    userName = arg.userName;//创建人name
    company = arg.company;//创建人公司代码
    toUserId = arg.toUserId;//转给人id
    toUserName = arg.toUserName;//转给人name
    toCompany = arg.toCompany;//转给人company

    // 设置你的私钥路径，用于请求的签名，对应的公钥请填写到 Ping++ 管理平台
    pingpp.setPrivateKeyPath(__dirname + "/rsa_private_key.pem");
    order_no = crypto.createHash('md5').update(new Date().getTime().toString()).digest('hex').substr(0, 16);
    client_ip = Request.connection.remoteAddress;
    console.log(client_ip);
    pingpp.charges.create({
        subject : subject, //商品的标题
        body : body, //商品的描述信息
        amount : amount, //订单总金额, 单位为对应币种的最小货币单位，例如：人民币为分（如订单总金额为 1 元，此处请填 100）。
        order_no : order_no, //商户订单号，适配每个渠道对此参数的要求，必须在商户系统内唯一
        channel : channel,
        currency : "cny",
        client_ip : client_ip,
        app : {
            id : APP_ID
        }
    }, function(err, charge) {
        if (err) { 
            Response.end(JSON.stringify({
                "status" : "-1",
                "msg" : "支付请求失败",
                "msgStatus" : "E40033001"
            }));
        } else {
            saveToPayLogs(charge, Response);
        }
    });
}

//保存请求支付记录
function saveToPayLogs(charge, Response) {

    var conn = mongoose.createConnection(global.mongodbURL);
    var CarpoolToPayModel = conn.model("pay_ToPay", sm.CarpoolToPaySchema);
    var CarpoolToPayEntiy = new CarpoolToPayModel({
        userId : userId,
        userName : userName,
        company : company,
        toUserId : toUserId,
        toUserName : toUserName,
        toCompany : toCompany,
        amount : amount,
        channel : channel,
        subject : subject,
        body : body,
        order_no : order_no,
        currency : "cny",
        client_ip : client_ip,
        chargeId : charge.id,
        status:0,
        creatTime : new Date().getTime(),
         updateTime:new Date().getTime()
    });
    CarpoolToPayEntiy.save(function(err, doc) {
        conn.close();
        if (!err) {
            Response.end(JSON.stringify({
            "status": "0",
            "charge": charge,
            "msgStatus":"S40033001",
            "msg":"支付请求成功"
            }));
        } else {
            Response.end(JSON.stringify({
                "status" : "-1",
                "msg" : "支付请求失败",
                "msgStatus" : "E40033002",
                "err":err
            }));
        }
    });

}

exports.Runner = run;

