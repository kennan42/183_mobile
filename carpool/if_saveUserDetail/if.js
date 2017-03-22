var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../carpoolSchema.js");

/**
 * 
 *司机-只保存个人信息
  作者:xialin
  时间:2016-4-8
 */
function run(Param, Robot, Request, Response, IF)
{
    var arg = JSON.parse(Param.body.toString());

    var db = mongoose.createConnection(global.mongodbURL);
   
    
    var CarpoolUserModel=db.model("carpoolUser",sm.CarpoolUserSchema);//用户信息

    var CarpoolUserEntity =new CarpoolUserModel({
        userId:arg.userId,
        userName:arg.userName ,//姓名
       company:arg.company, //公司 
       userDept :arg.userDept, //部门
       userPhotoURL:arg.userPhotoURL,  //压缩照片地址
       photoURL2:arg.photoURL2, //原始照片地址
       phoneNumber:arg.phoneNumber, //电话号码
       driverYear:arg.driverYear, //驾龄 
       weixin: arg.weixin, //微信账户
       zhifubao:arg.zhifubao, //支付宝
       createdAt:new Date().getTime(),//建立日期时间
       updateTime:new Date().getTime()//最后修改日期时间
        
    });
        
            CarpoolUserEntity.save(function(err,data){
                Response.setHeader("Content-type","text/json;charset=utf-8");
                db.close();
                if(!err){
                    Response.end(JSON.stringify(
                    {  status:0,
                       msgStatus:"S4000110",
                       msg:'保存成功'
                     }
                      ));
                }else{
                    Response.end(JSON.stringify(
                 {
                    status:-1,
                    msgStatus:"E4000118",
                    msg:'保存失败'
                }));
                }
            }); 
   
} 

exports.Runner = run;


                                

    

