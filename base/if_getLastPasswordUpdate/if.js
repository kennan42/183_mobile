var MEAP = require("meap");
var path = require("path");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../BaseSchema.js");
var async = require("async");
/**
 *
 * 获取AD密码最后修改时间
 * 作者:xialin
 * 时间:2016-01-19
 * 根据本地保存的最后登录时间来修改,当本地登录时间<修改时间，说明修改过没有登录。如果本地时间大于修改时间，说明用的新密码登录
 *
 */

function run(Param, Robot, Request, Response, IF) {
 

    var userId = Param.params.loginName;
    var lastLoginTime=Param.params.lastLoginTime;

    var option = {
        //旧的wsdl:"http://192.168.2.48/AdService/AdWebService.asmx?wsdl",
        //新的wsdl   http://192.168.1.93/AdWebServiceiv/AdWebService.asmx?wsdl
        wsdl : path.join(__dirname.replace(IF.name, ""), global.wsdl, "AdWebService.xml"),
        func : "AdWebService.AdWebServiceSoap.GetPasswordLastSet",
        Params : '<cttq:GetPasswordLastSet>' + '<cttq:loginName>' + userId + '</cttq:loginName>' + '<cttq:invokeUser>cttq</cttq:invokeUser>' + '<cttq:invokePassword>cttq123.com</cttq:invokePassword>' + '<cttq:invokeApp></cttq:invokeApp>' + '</cttq:GetPasswordLastSet>',
        BasicAuth : global.TXSOAPAuth,
        agent : false
    };

    MEAP.SOAP.Runner(option, function(err, res, data) {

        if (!err) {
            //比较时间，如果不存在，返回结果为{}，说明从没修改过密码
            var time = "0";
            if ("{}" != JSON.stringify(data.GetPasswordLastSetResult)) {
                time = data.GetPasswordLastSetResult;
            }
            var lastLoginTime = new Date();
            lastLoginTime.setTime(Param.params.lastLoginTime);
            console.log(lastLoginTime);
            var year = lastLoginTime.getFullYear();
            var month = lastLoginTime.getMonth() + 1 < 10 ? "0" + (lastLoginTime.getMonth() + 1) : lastLoginTime.getMonth() + 1;
            var day = lastLoginTime.getDate() < 10 ? "0" + lastLoginTime.getDate() : lastLoginTime.getDate();
            var hours = lastLoginTime.getHours()<10?"0"+(lastLoginTime.getHours()):lastLoginTime.getHours();
            var minutes = lastLoginTime.getMinutes()<10 ? "0"+(lastLoginTime.getMinutes()):lastLoginTime.getMinutes();
            var seconds = lastLoginTime.getSeconds()<10 ?"0"+(lastLoginTime.getSeconds()):lastLoginTime.getSeconds();
            var data2 = year + "" + month + "" + day + "" + hours + "" + minutes + seconds;
            var updateStatus = 0;
            if (time >= data2) {
                //返回需要修改

                var month = time.substring(4, 6);
                var day = time.substring(6, 8);
                var hours = time.substring(8, 10);
                var min = time.substring(10, 12);
                if (month * 1 < 10) {
                    month = month * 1;
                }
                if (day * 1 < 10) {
                    day = day * 1;
                }
                if (hours * 1 < 10) {
                    hours = hours * 1;
                }
                if (min * 1 < 10) {
                    min = min * 1;
                }

                time = month + "月" + day + "日" + hours + "点" + min + "分";

                Response.end(JSON.stringify({
                    status : '1',
                    lastLoginTime : data2,
                    updateTime : time,
                    updateStatus : 1
                }));
            } else {

                Response.end(JSON.stringify({
                    status : '1',
                    lastLoginTime : data2,
                    updateStatus : 0
                }));

            }

        } else {
            Response.end(JSON.stringify({
                status : '-1',
                msg : "调用接口错误"
            }));

        }

    });

}

exports.Runner = run;

