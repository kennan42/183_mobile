var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../carpoolSchema.js");



/**
 * 
 * 更改驾龄: 如果有之前维护驾龄，显示，如果之前没有则重新维护
 * 作者：xialin
 * 时间：2016-4-11
 * 
 */
function run(Param, Robot, Request, Response, IF)
{
     var arg=JSON.parse(Param.body.toString());
     var db=mongoose.createConnection(global.mongodbURL);
     var CarpoolUserModel=db.model("carpoolUser",sm.CarpoolUserSchema);
      Response.setHeader("Content-type","text/json;charset=utf-8");
     CarpoolUserModel.findOne({userId:arg.userId,company:arg.company}).exec(function(err,data){
       
          if(!err){
              if(data!=null){
                  CarpoolUserModel.update({userId:arg.userId,company:arg.company},{driverYear:arg.driverYear}).exec(function(err,data){
                      db.close();
                      if(!err){
                          Response.end(JSON.stringify({
                              status:0,
                              msg:"更新成功"
                          }));
                      }else{
                          Response.end(JSON.stringify({
                              status:-1,
                              msg:"更新失败"
                          }));
                      }
                  });
              }else{
                 var CarpoolUserEntity=new CarpoolUserModel({
                     userId:arg.userId,
                     userName:arg.userName,
                     company:arg.company,
                     userDept:arg. ,
                     photoStatus:0,
                     userPhotoURL:arg.userPhotoURL,
                     photoURL2:arg.photoURL2,
                     phoneNumber:arg.phoneNumber,
                     driverYear:arg.driverYear,
                     weixin:arg.weixin,
                     zhifubao:arg.zhifubao,
                     updateTime:new Date().getTime(),
                     createdAt:new Date().getTime()
                 });
                 CarpoolUserEntity.save(function(err,doc){
                     db.close();
                     if(!err){
                        Response.end(JSON.stringify({
                            status:0,
                            msg:"维护成功"
                        })); 
                     }else{
                         Response.end(JSON.stringify({
                             status:-1,
                             msg:"维护失败"
                         }));
                     }
                 });
              }
          }else{
              Response.end(JSON.stringify({
                  status:-1,
                  msg:"维护失败"
              }));
          }
        
     });
}

exports.Runner = run;


                                

	

