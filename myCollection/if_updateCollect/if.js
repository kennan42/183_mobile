var MEAP=require("meap");

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../myCollectSchema.js");

/**
*  更新收藏，取消收藏
 * 作者：xialin
 * 时间：20170229
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
**/


function run(Param, Robot, Request, Response, IF)
{
     var arg = JSON.parse(Param.body.toString());
     
     var userId =arg.userId;  //用户userId
     var cid =arg.cid;   //cid 
     var type =arg.type; //类型
  
     var db = mongoose.createConnection(global.mongodbURL);
     var myCollectModel = db.model("myCollect", sm.MyCollectSchema);
     
     myCollectModel.update({"cid":cid,"userId":userId,type:type},{
       
        status:0
        
    }).exec(function (err,data){
         Response.setHeader("Content-type","text/json;charset=utf-8");
         db.close();
         if(!err){
               Response.end(JSON.stringify({status:0, message:"更新成功"})); 
         }else{
                Response.end(JSON.stringify({status:-1, message:"更新失败"})); 
         }
     });
    

}

exports.Runner = run;