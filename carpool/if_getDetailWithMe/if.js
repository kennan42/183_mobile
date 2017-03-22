var MEAP = require("meap");

var ContactSchema = require("../Contact.js");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");

var   integralUtil=  require("integralUtil");   

 
/**
 * 功能：我和爱车详情页（我是司机）       这里要判断是否是正大天晴员工
 *      从HR数据查询人员信息，查询车龄支付宝，查询车辆
 * 作者：xialin
 * 时间：20160331
 */

var arg = null;
var db = null;
function run(Param, Robot, Request, Response, IF) {
   
    arg = JSON.parse(Param.body.toString())
   
    db = mongoose.createConnection(global.mongodbURL);
    main(Response); 

}


function main(Response){
    async.parallel([getUserInfo,getDriverYear,getMyCars,getIntegralScore],
        function(err,data){
            
            Response.setHeader("Content-type","text/json;charset=utf-8");
            db.close();
            if(!err){
                Response.end(JSON.stringify({
                    status:"0",
                    msg:"查询成功",
                    msgStatus:"S4000112",
                    userInfo:data[0],
                    driverYear:data[1],
                    cars:data[2],
                    scores:data[3]
                }));
            }else{
                Response.end(JSON.stringify({
                    status:"-1",
                    msgStatus:"E4000120",
                    msg:"查询失败"
                }));
            }
    });
}


//查看用户基本信息
function getUserInfo(callback){
    
    //如果是正大天晴员工
    if(arg.company!=null&&arg.company=="cttq"){
    var userId = new RegExp(arg.userId);
    var userModel = db.model("base_user", ContactSchema.BaseUserSchema);
    userModel.find({
        PERNR : userId
    }, {
        ZZ_TEL : 1,
        NACHN : 1,
        ORGTX : 1,
        photoURL:1,  //压缩照片地址
        photoURL2:1, //原始照片地址
        _id : 0

    }).exec(function(err, data) {
        callback(err,data);
    });
    }else{
        
        callback('',[]);
    }
     
}


//查看驾龄支付宝等信息    根据公司字段查询
function getDriverYear(callback){
   var CarpoolUserModel=db.model("carpoolUser",sm.CarpoolUserSchema);//用户信息
   CarpoolUserModel.find({userId:arg.userId,company:arg.company}).exec(function(err, data) {
        callback(err,data);
    });
   
}


//查看车辆信息
function getMyCars(callback){
   var CarpoolCarModel=db.model("carpoolcar",sm.CarpoolCarSchema);
   var CarpoolAttachmentModel = db.model("carpoolAttachment",sm.CarpoolAttachmentSchema);
   CarpoolCarModel.find({carOwnerId:arg.userId,company:arg.company,state:1}).populate("carImg").exec(function(err,data){
       callback(err,data);
   });
}


//查询积分
function getIntegralScore(callback){
     var pp= {

     "userId":arg.userId,
     "modelid":"carpool",
     "company":arg.company
      };
      
  integralUtil.getIntegralScoreByModelId(pp,function(err,data){
        callback(err,data);
   });
   
}
 



exports.Runner = run;

