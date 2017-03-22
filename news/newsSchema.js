var mongoose = require("mongoose");
var Schema = mongoose.Schema;

//评论表
var NewsCommentSchema = new Schema({
    cid : String, //新闻cid
    app_code : String, //app
    userId : String, //工号
    userName : String, //姓名
    userUrl : String, //头像url
    article : String, //新闻标题
    comment : String, //评论
    createTime : Number, //创建时间
    data_status : Number //0-正常  1删除

});

//点赞和点击数
var NewsClickSchema = new Schema({
    cid : String, //cid
    number_like : Number, //点赞数
    number_click:Number,//点击数 
	

});

//用户点赞表

var NewsLikeSchema =new Schema({
	
	cid :String,
	userId:String,
	status:Number //是否点赞   0：未点赞  1：已点赞
	
});



//用户收藏表
var  NewsCollectSchema =new Schema({
	cid :String,
	newsUrl:String, //新闻url
	article:String ,//新闻标题
	publisher:String ,//新闻发布人
	iconUrl:String, //新闻icon的URL，有多张url
	newsTime:String,//新闻发布时间
	userId:String, //收藏人
	createTime:String, //收藏时间
	status:Number //是否收藏  0：未收藏  1：已经收藏
	
});


//用户收藏表
var  MyCollectSchema =new Schema({
	
	type:String, //类型：   新闻  天知道
	newsUrl:String, //新闻地址
	cid:String ,//CID
	imgUrl:String, //图片地址
	article:String ,//标题
	publisher:String ,//发布人
	userId:String, //收藏人
	createTime:Number, //收藏时间
	status:Number //是否收藏  0：未收藏  1：已经收藏
	
});




exports.NewsCommentSchema = NewsCommentSchema; 
exports.NewsClickSchema =NewsClickSchema;
exports.NewsLikeSchema =NewsLikeSchema;
exports.NewsCollectSchema=NewsCollectSchema;
exports.MyCollectSchema =MyCollectSchema;