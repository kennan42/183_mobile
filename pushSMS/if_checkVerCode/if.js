var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../VcodeSchema.js");
var async = require("async");
/**
 *
 * 验证验证码功能
 *
 * 1.取出mongodb数据
 * 2.验证码与时间对比，若未超时且一致则通过
 * 3.mongdodb标记为1.表示已经验证
 *
 *
 *
 *
 */

var delayTime = 60 * 1000;  //超时时间1分钟

function run(Param, Robot, Request, Response, IF) {

    var arg = JSON.parse(Param.body.toString());
    Response.setHeader("Content-type", "text/json;charset=utf-8");
    var phoneNumber = arg.phoneNumber;
    var vcode = arg.vcode;
    //获取验证码
    var nowTime = new Date().getTime();
    //获取当前时间

    var conn = mongoose.createConnection(global.mongodbURL);
    var codeModel = conn.model("vcodeLog", sm.VcodeLogSchema);

    codeModel.findOne({
        phoneNumber : phoneNumber
    }, function(err, data) {
        if (!err) {
            //对比
            console.log(data);
            if (data.vcode != null && data.sendTime != null) {
                var time = nowTime - data.sendTime;
                if (time <= delayTime) {
                    //验证码未超时
                    if (data.vcode == vcode) {
                         //OK
                        Response.end(JSON.stringify({
                            status : 0,
                            msg : "验证成功"
                        }));

                        codeModel.update({
                            "phoneNumber" : phoneNumber
                        }, {

                            "isUsed" : 1
                        }, {
                            "upsert" : true
                        }, function(err) {
                            conn.close();
                            if (!err) {

                            } else {

                                Response.end(JSON.stringify({
                                    status : -1,
                                    msg : "保存失败"
                                }));

                            }
                        });

                    } else {
                        //验证码err
                        Response.end(JSON.stringify({
                            status : -1,
                            msg : "验证码错误"
                        }));
                    }

                } else {
                    //验证码超时
                    Response.end(JSON.stringify({
                        status : -1,
                        msg : "验证码超时"
                    }));
                }

            } else {
                Response.end(JSON.stringify({
                    status : -1,
                    msg : "没有验证码"
                }));

            }

        } else {
            Response.end(JSON.stringify({
                status : -1,
                msg : "查询错误"
            }));
        }

    });

}

exports.Runner = run;




/**
 * var client = new TopClient({
        'appkey' : appkey,
        'appsecret' : appsecret,
        'REST_URL' : url
    });
    
    
  client.execute('taobao.open.sms.checkvercode', {
        check_ver_code_request  : {
            "mobile" : "18252051231",//,15705213512
            //"mobile" : "18252051231",
            "ver_code" : 1234
            
        }
    }, function(error, response) {
        if (!error) {
            console.log(response.result.successful);
            var successful= response.result.successful;
            if(successful){
                 Response.end(JSON.stringify({
                "status" : "1",
                "msg" : "验证成功"
                 }));
            }else{
                
                Response.end(JSON.stringify({
                "status" : "-3",
                "msg" : "验证失败"
                 }));
                
            }
            
            
           
        } else {
            console.log(error);
            Response.end(JSON.stringify({
                "status" : "-4",
                "msg" : "验证失败"
            }));
        }

    });    
    
 * 
 * 
 */                                

    

