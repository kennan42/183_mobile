var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../CarpoolPaySchema.js");
var async = require("async");
/**
 * 企业B2C支付成功后，收到webhooks支付成功通知
 * 作者：xiain
 * 时间：20160426
 */

var conn;
var arg;
function run(Param, Robot, Request, Response, IF) {

    Response.setHeader("Content-Type", "text/json;charset=utf8");
    arg = JSON.parse(Param.body.toString());

    if (arg.type == undefined) {
        Response.statusCode = 500;
        Response.end(JSON.stringify({
            status : 400,
            msg : "Event 对象中缺少 type 字段"
        }));
    }

    switch(arg.type) {
    case "transfer.succeeded":
        // 开发者在此处加入对支付异步通知的处理代码
        conn = mongoose.createConnection(global.mongodbURL);
        async.parallel([saveEventLogs, updateTransferLogs], function(err, data) {
            if (!err) {
                Response.statusCode = 200;
                Response.end(JSON.stringify({
                    status : 0,
                    msg : "企业付款成功"
                }));
            } else {
                Response.statusCode = 500;
                Response.end(JSON.stringify({
                    status : -1,
                    msg :data
                }));
            }
        });

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

//更新trans日志
function updateTransferLogs(callback) {
     console.log("---in--------> updateTransferLogs");
    var TransferLogsModel = conn.model("pay_transferLogs", sm.TransferLogsSchema);
    TransferLogsModel.update({
        transferId : arg.data.object.id
    }, {
        status : 1
    }).exec(function(err, data) {
        if (!err) {
            
            callback(err, data);
        } else {
            callback(-1, "更新trans日志失败");
        }

    });

}

//转账成功记录
//更新trans日志
function saveEventLogs(callback) {
    console.log("---in--------> saveEventLogs");
    var TransEventLogsModel = conn.model("pay_transEventLogs", sm.TransEventLogsSchema);
    var transferId = "";
    if (null != arg.data.object.id) {
        transferId = arg.data.object.id;
    }
    
    
    var TransEventLogsEntiy = new TransEventLogsModel({
        eventId : arg.id,
        transferId : transferId,
        eventObject : JSON.stringify(arg),
        createTime : new Date().getTime() //创建时间
    });

    TransEventLogsEntiy.save(function(err, data) {
        if (!err) {
            callback(err, data);
        } else {
            callback(-1, "保存TransEvent失败");
        }

    });
}

exports.Runner = run; 