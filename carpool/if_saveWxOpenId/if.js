var MEAP = require("meap");
var crypto = require('crypto');
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../carpoolSchema.js");

/**
 *  保存微信openID
 *  作者：xialin
 *  时间：20160427
 *  要验证接口的合法性 
 *
 */
function run(Param, Robot, Request, Response, IF) {

    var arg = JSON.parse(Param.body.toString());
    var wxOpenId = arg.wxOpenId;
    var userId =arg.userId;
    var userName =arg.userName;
    var company =arg.company;

    var conn = mongoose.createConnection(global.mongodbURL);
    var WxAccountModel = conn.model("wxAccount", sm.WxAccountSchema);
    //加密
    var encrypted = "";
    var key = "abc";
    var cip = crypto.createCipher('rc4', key);
    encrypted += cip.update(wxOpenId, 'binary', 'hex');

    encrypted += cip.final('hex');

    var WxAccountEntiy = new WxAccountModel({
        wxOpenId : encrypted,
        userId : userId,
        userName : userName,
        company : company,
        createTime : new Date().getTime()

    });
    WxAccountEntiy.save(function(err, data) {
        conn.close();
        if (!err) {
            Response.end(JSON.stringify({
                status : 0,
                msg : "保存成功",
                msgStatus:"S4000120"
            }));
        } else {
            Response.end(JSON.stringify({
                status : -1,
                msg : "保存失败",
                msgStatus:"E4000120"
            }));
        }
    });

}

exports.Runner = run; 