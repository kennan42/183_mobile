var MEAP=require("meap");
var TopClient = require('topSdk').TopClient;
var appkey = '23266759';
var appsecret = '2fdd00b89cf6aa08e264a866262d8c66';
var url = "http://gw.api.taobao.com/router/rest";
var mongoose = require("mongoose");
var async = require("async");
var Schema = mongoose.Schema;
var sm = require("../VcodeSchema.js");


/**
 * 发送短信验证码
 * 时间：20161031
 * ken
 * 
 * 
 * 
 */
function run(Param, Robot, Request, Response, IF)
{

    var arg = JSON.parse(Param.body.toString());
    Response.setHeader("Content-type", "text/json;charset=utf-8");
    //生成验证码
    var  phoneNumber =arg.phoneNumber;
   
    var codeNumber = "";
    for (var i = 0; i < 6; i++) {
        codeNumber += Math.floor(Math.random() * 10);
    }

 
   //获取当前时间
   var  currentDate =new Date().getTime();
   
   var client = new TopClient({
            'appkey' : global.sms.appkey,
            'appsecret' : global.sms.appsecret,
            'REST_URL' : global.sms.url
        });
   
      var sendType = "SMS_34895316";
   
   var send_message_request = {

                'sms_type' : 'normal',
                'sms_free_sign_name' : '天信',
                'sms_param' : {
                    "code" : codeNumber
                },
                'rec_num' : phoneNumber,
                'sms_template_code' : sendType

            };
   
   
   
   
   
     
    //保存数据中 
    
     async.series([ 
     function(cb) {
         //保存在mongodb中
          var conn = mongoose.createConnection(global.mongodbURL);
          var codeModel = conn.model("vcodeLog", sm.VcodeLogSchema);
          codeModel.update({"phoneNumber":phoneNumber},{
              
             "vcode":codeNumber,
             "sendTime":new Date().getTime(),
             "isUsed":0
          },{ "upsert" : true},function(err){
              conn.close();
              if(!err){
                  cb(null,"");
              }else{
                  
                Response.end(JSON.stringify({
                status:-1,
                msg:"保存失败"
               }));
                  
              }
          });
     
    },
    
      function(cb) {
           
         client.execute('alibaba.aliqin.fc.sms.num.send',send_message_request , function(error, response) { 

                    if (!error) { 

                        console.log(response);

                        var successful = response.result.success;
                        if (successful) {
                            cb(null, "");
                        } else {

                            Response.end(JSON.stringify({
                                "status" : -1,
                                
                                "msg" : "发送短信失败"
                            }));
                            return;

                        }

                    } else {
                        console.log(error);
                        Response.end(JSON.stringify({
                            "status" : -1,
                            
                            "msg" : "调用阿里大于接口失败"
                        }));
                        return;
                    }

                });
         
         
            
          
    
       }], function(err, data) {
           if(!err){
               Response.end(JSON.stringify({
                status:0,
                msg:"发送验证码成功"
               }));
           }else{
               Response.end(JSON.stringify({
                status:-1,
                msg:"发送验证码失败"
               }));
           }
               
             
           
       });
    
  
     
	
	

    
}

exports.Runner = run;


/***
 * 
 * var client = new TopClient({
        'appkey' : appkey,
        'appsecret' : appsecret,
        'REST_URL' : url
    });
    
    
  client.execute('taobao.open.sms.sendvercode', {
        send_ver_code_request : {
            "mobile" : "18252051231",//,15705213512
            //"mobile" : "18252051231",
            "template_id" : 639,
            "context" : {
                "code" : 1234
            }
        }
    }, function(error, response) {
        if (!error) {
            console.log(response.result.successful);
            var successful= response.result.successful;
            if(successful){
                 Response.end(JSON.stringify({
                "status" : "1",
                "msg" : "发送短信成功"
                 }));
            }else{
                
                 Response.end(JSON.stringify({
                "status" : "-3",
                "msg" : "发送短信失败"
                 }));
                
            }
            
            
           
        } else {
            console.log(error);
            Response.end(JSON.stringify({
                "status" : "-4",
                "msg" : "发送短信失败"
            }));
        }

    });    
    
 * 
 * 
 * 
 */                                

	

