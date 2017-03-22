var MEAP=require("meap");
var crypto = require('crypto');
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../CarpoolPaySchema.js");


/**
 *  保存微信
 * 
 * 
 */
function run(Param, Robot, Request, Response, IF)
{
   var conn = mongoose.createConnection(global.mongodbURL);
    var WxAccountModel = conn.model("wxAccount", sm.WxAccountSchema);
   
    var encrypted="";
    var key = "abc";
   var cip = crypto.createCipher('rc4', key);
   encrypted += cip.update('ch_m9S4K0fnDOy5zLOqn9nXj5CG', 'binary', 'hex');
                            
    encrypted += cip.final('hex');
    
    
    var WxAccountEntiy =new WxAccountModel({
         wxOpenId:encrypted,
         userId:"8103666",
         userName:"张三",
         company:"cttq",
         createTime:new Date().getTime()
          
    });
   WxAccountEntiy.save(function(err,data){
       conn.close();
         if(!err){
             Response.end(JSON.stringify({
                 status:0,
                 msg:"ok"
             }));
         } else{
             Response.end(JSON.stringify({
                 status:-1,
                 msg:"err"
             }));
         }
   });
   
}

exports.Runner = run;