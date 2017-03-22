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
 *
 *
 */

function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.loginName;
    var db = mongoose.createConnection(global.mongodbURL);
    var lastPasswordUpdateModel = db.model("lastPasswordUpdate", sm.lastPasswordUpdateSchema);

    async.parallel({
        one : function(done) {

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
                done(err, data);
            });

        },
        two : function(done) {

            lastPasswordUpdateModel.findOne({
                userId : userId
            }).exec(function(err, data) {
                done(err, data);
            });
        },
    }, function(err, result) {
        if (!err) {

            var data1 = result.one;
            var data2 = result.two;
            var time = "0";
            if ("{}" != JSON.stringify(data1.GetPasswordLastSetResult)) {
                time = data1.GetPasswordLastSetResult;
            }

            if (data2 == null) {
                //说明没有记录密码,第一次 ，保存记录,同时返回0
                console.log("==null");
                var lastPasswordUpdateEntiy = new lastPasswordUpdateModel({

                    userId : userId,
                    updateTime : v,
                    status : 0
                });

                lastPasswordUpdateEntiy.save(function(err, data3) {
                    db.close();
                    if (!err) {

                        Response.end(JSON.stringify({
                            status : "1",
                            updateStatus : 0
                        }));

                    } else {

                        Response.end(JSON.stringify({
                            status : '-1',
                            message : '数据库保存错误'
                        }));
                    }
                });
            } else {

                //不等于null，说明有记录 ，对比下看是否是修改
                if (data2.updateTime != time) {
                    //说明不相等，更改记录
                    lastPasswordUpdateModel.update({
                        userId : userId
                    }, {
                        updateTime : time
                    }).exec(function(err, data4) {
                        db.close();
                        if (!err) {

                            // updateStatus : 1有修改
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
                                status : "1",
                                updateStatus : 1,
                                lastTime : time
                            }));

                        } else {
                            Response.end(JSON.stringify({
                                status : '-1',
                                message : '数据库更新错误'
                            }));
                        }

                    });

                } else {

                    db.close();
                    // updateStatus : 0未修改
                    Response.end(JSON.stringify({
                        status : "1",
                        updateStatus : 0
                    }));
                }

            }

        } else {
            db.close();
            Response.end(JSON.stringify({
                status : '-1',
                message : 'Error'
            }));

        }

    });

}

exports.Runner = run;

