var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../newsSchema.js");
var async = require("async");

/**
 * 
 * 新闻点赞数 , 用户点赞同时记录点赞表
 * 作者：xialin
 * 时间：20160929
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
 
 var  arg=null;
 var  cid =null;
 var userId =null;
 var  db =null;
 
 
function run(Param, Robot, Request, Response, IF)
{
   
      arg = JSON.parse(Param.body.toString());
      cid =arg.cid; //
      userId =arg.userId;
     
      db = mongoose.createConnection(global.mongodbURL);
    
      main(Response);
     
     //首先查看是否已经点赞，这里默认肯定是未点赞的

}





function main(Response){
    async.parallel([updateLike,updateNewsLike],function(err,data){
        Response.setHeader("Content-type","text/json;charset=utf-8");
        db.close();
        if(!err){
            Response.end(JSON.stringify({
                status:"0",
                msg:"点赞成功"
				
            }));
        }else{
            Response.end(JSON.stringify({
                status:"-1",
                msg:"点赞失败"
				
            }));
        }
    });
}

//设置点赞表
function    updateLike(callback){
    
     var newsLikeModel = db.model("newsLike", sm.NewsLikeSchema);
     newsLikeModel.update({"cid":cid},{userId:userId,status:1},{"upsert" : true}).exec(function (err,data){
		 console.log(data);
		   callback(err,data);
        
     });
    
    
}

//设置点击和点赞表
function    updateNewsLike(callback){
    
     var newsModel = db.model("newsClick", sm.NewsClickSchema);
     newsModel.update({"cid":cid},{$inc:{"number_like":1}},{"upsert" : true}).exec(function (err,data){
		   callback(err,data);
        
     });
}






exports.Runner = run;