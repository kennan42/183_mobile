var MEAP = require("meap");
var crypto = require('crypto');

var API_KEY = "sk_test_XzTiTOHezzrPSaPafD1uHev1"// 这里填入你的 Test/Live Key
var APP_ID = "app_0OijzHTunPCOnfLW"// 这里填入你的应用 ID
var pingpp = require('pingpp')(API_KEY);

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../CarpoolPaySchema.js");

/**
 *
 * 微信 支付成功后接受ping++传来的webhooks，然后企业微信付款给用户
 * 1.先根据chargeID查找记录，2.查找到转给人id，3、根据转给人id找到openid，然后在转账
 * wx_pub:(微信公众账号支付)
 * 作者：xialin
 * 时间：20160425
 *
 */

var conn;
var arg;
var toUserId;
var toUserName;
var toCompany;
var amount;
var chargeId;
var channel = "wx_pub";
var order_no;
var wxOpenId;

function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type", "text/json;charset=utf8");
    arg = JSON.parse(Param.body.toString());

    if (arg.type == undefined) {
        Response.end(JSON.stringify({
            status : 400,
            msg : "Event 对象中缺少 type 字段"
        }));
    }

    switch(arg.type) {
    case "charge.succeeded":
        // 开发者在此处加入对支付异步通知的处理代码
        conn = mongoose.createConnection(global.mongodbURL);
        
        main(Response);

        break;

    default:
        Response.statusCode = 500;
        Response.end(JSON.stringify({
            status : 400,
            msg : "未知 Event 类型"
        }));
        break;

    }

}

function main(Response) {
    async.waterfall([saveEventLogs,findCharge, updateLogs, findOpenId, transferToUser, addTransferLogs], function(err, data) {

        console.log(data);
        conn.close();
        if (!err) {
            Response.statusCode = 200;
            Response.end(JSON.stringify({
                status : "0",
                msg : "B2C转账成功",
                transfer : data

            }));
        } else {
            Response.statusCode = 500;
            Response.end(JSON.stringify({
                status : "-1",
                msgStatus : "E4000120",
                msg : data

            }));
        }
    });
}

//支付成功记录
//更新trans日志
function saveEventLogs(callback) {
    console.log("---in--------> saveEventLogs");
    var PayEventLogsModel = conn.model("pay_payEventLogs", sm.PayEventLogsSchema);
    var chargeId = "";
    if (null != arg.data.object.id) {
        chargeId = arg.data.object.id;
    }

    var PayEventLogsEntiy = new PayEventLogsModel({
        eventId : arg.id,
        chargeId : chargeId,
        eventObject : JSON.stringify(arg),
        createTime : new Date().getTime() //创建时间
    });

    PayEventLogsEntiy.save(function(err, data) {
        console.log("data: "+data);
        if (!err) {

            callback(err, data);
        } else {
            callback(-1, "保存PaysEvent失败");
        }

    });
}

//查找转账人的用户ID

function findOpenId(userId, cb) {
    console.log("---in--------> findOpenId");
    var WxAccountModel = conn.model("wxAccount", sm.WxAccountSchema);
    WxAccountModel.findOne({
        userId : userId

    }, {
        wxOpenId : 1
    }).exec(function(err, data) {

        if (!err && data != null && data.wxOpenId != null) {
            wxOpenId = data.wxOpenId;
            cb(err, data.wxOpenId);
        } else {
            cb(-1, '查找openId失败');
        }

    });

}

//根据chargeID查找支付记录
function findCharge(data,callback) {
    console.log("---in--------> findCharge");
    chargeId = arg.data.object.id;

    var CarpoolToPayModel = conn.model("pay_ToPay", sm.CarpoolToPaySchema);
    CarpoolToPayModel.findOne({
        chargeId : chargeId
    }, {
        toUserId : 1,
        toUserName : 1,
        toCompany : 1,
        amount : 1
    }).exec(function(err, data) {

        if (!err && data != null && data.toUserId != null) {
            toUserId = data.toUserId;
            toUserName = data.toUserName;
            toCompany = data.toCompany;
            amount = data.amount;

            callback(err, data.toUserId);
        } else {
            callback(-1, "查找chargeId失败");

        }

    })
}

//更新carpoolToPay 的支付状态
function updateLogs(toUserId, callback) {

    console.log("---in--------> updateLogs");
    chargeId = arg.data.object.id;

    var CarpoolToPayModel = conn.model("pay_ToPay", sm.CarpoolToPaySchema);
    CarpoolToPayModel.update({
        chargeId : chargeId
    }, {
        status : 1,
        updateTime : new Date().getTime()
    }).exec(function(err, data) {

        if (!err) {

            callback(err, toUserId);
        } else {
            callback(-1, "更新支付状态失败");

        }

    })
}

//企业转账给用户-微信公众号转给用户
function transferToUser(wxOpenId, callback) {

    console.log("---in--------> transferToUser");

    var openId = "";
    var key = "abc";
    var decipher = crypto.createDecipher('rc4', key);
    openId += decipher.update(wxOpenId, 'hex', 'binary');
    openId += decipher.final('binary');

    //用户金额
    var amount = arg.data.object.amount;

    //微信openId
    order_no = crypto.createHash('md5').update(new Date().getTime().toString()).digest('hex').substr(0, 16);

    // 设置你的私钥路径，用于请求的签名，对应的公钥请填写到 Ping++ 管理平台
    pingpp.setPrivateKeyPath(__dirname + "/rsa_private_key.pem");
    pingpp.transfers.create({
        order_no : order_no,
        app : {
            id : APP_ID
        },
        channel : channel,
        amount : amount,
        currency : "cny",
        type : "b2c",
        recipient : openId,
        description : "公司转账给个人"
    }, function(err, transfer) {
       
        callback(err, transfer);
    });

}

//添加企业支付logs
function addTransferLogs(transfer, callback) {
    console.log("---in--------> addTransferLogs");

    var TransferLogsModel = conn.model("pay_transferLogs", sm.TransferLogsSchema);
    var TransferLogsEntiy = new TransferLogsModel({
        toUserId : toUserId, //转给人
        toUserName : toUserName, //name
        toCompany : toCompany, //公司代码
        amount : amount, //金额
        channel : channel, //渠道
        wxOpenId : wxOpenId,
        chargeId : chargeId, //chargeId
        transferId : transfer.id, //transferId
        order_no : order_no, //transfer的 order_no  企业转账使用的商户内部订单号
        status : 0, //转账记录状态   0：开始转账      1：转账成功   2：转账失败
        createTime : new Date().getTime(), //创建时间
        updateTime : new Date().getTime()
    });

    TransferLogsEntiy.save(function(err, data) {

        callback(err, transfer);
    });

}

exports.Runner = run;
