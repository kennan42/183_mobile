var MEAP=require("meap");

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../newsSchema.js");

/**
 * 
 * 点击新闻收藏
 * 作者：xialin
 * 时间：20160929
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param, Robot, Request, Response, IF)
{
    
     var arg = JSON.parse(Param.body.toString());
     var cid =arg.cid; //新闻cid
     var newsUrl =arg.newsUrl;  //新闻url
     var article=arg.article;   //新闻标题
     var publisher =arg.publisher;//发布人
     var iconUrl =arg.iconUrl;  //数组
     var newsTime =arg.newsTime;
     var userId =arg.userId;   

     
     var db = mongoose.createConnection(global.mongodbURL);
     var newsCollectModel = db.model("newsCollect", sm.NewsCollectSchema);
     
    newsCollectModel.update({"cid":cid,userId:userId},{
        newsUrl:newsUrl,
        article:article,
        publisher:publisher,
        iconUrl:iconUrl,
        newsTime:newsTime,
        createTime:new Date().getTime(),
        status:1
        
    },{"upsert" : true}).exec(function (err,data){
         Response.setHeader("Content-type","text/json;charset=utf-8");
         db.close();
         if(!err){
               Response.end(JSON.stringify({status:0, message:"Success"})); 
         }else{
                Response.end(JSON.stringify({status:-1, message:"err"})); 
         }
     });
    
    
    //Add your normal handling code 
  
}

exports.Runner = run;