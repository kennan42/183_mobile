var MEAP=require("meap");


var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../myCollectSchema.js");
/**
 * 
 * 我的收藏
 * 作者：xialin
 * 时间：20170229
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF

    type:String, //类型：   新闻  天知道
	userId:String, //收藏人
	cid:String, //天知道cid

	imgUrl:String, //图片地址
	newsUrl:String, //新闻地址
	article:String ,//标题
	publisher:String ,//发布人
	
	createTime:String, //收藏时间
	status:Number //是否收藏  0：未收藏  1：已经收藏

 */
function run(Param, Robot, Request, Response, IF)
{
     var arg = JSON.parse(Param.body.toString());
     var type =arg.type; //类型  ： iknow   news 
     var cid =arg.cid; //cid
     var userId =arg.userId;  //用户id
     
     var imgUrl =arg.imgUrl; //图片地址
     var newsUrl =arg.newsUrl;  //url
     var article=arg.article;   //标题
     var publisher =arg.publisher;//发布人
     var createTime =new Date().getTime();  //创建时间，用于默认收藏
     var defaultNews = arg.defaultNews ; //默认  1  
     if(defaultNews==1){
        createTime =arg.createTime
     }
  
     var db = mongoose.createConnection(global.mongodbURL);
     var myCollectModel = db.model("myCollect", sm.MyCollectSchema);
     
    myCollectModel.update({"cid":cid,"userId":userId,"type":type},{
        imgUrl:imgUrl,
        newsUrl:newsUrl,
        article:article,
        publisher:publisher,
        createTime:createTime,
        status:1
        
    },{"upsert" : true}).exec(function (err,data){
         Response.setHeader("Content-type","text/json;charset=utf-8");
         db.close();
         if(!err){
               Response.end(JSON.stringify({status:0, message:"收藏成功"})); 
         }else{
                Response.end(JSON.stringify({status:-1, message:"收藏失败"})); 
         }
     });
    

}

exports.Runner = run;