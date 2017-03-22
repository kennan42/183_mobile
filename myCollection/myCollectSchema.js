var mongoose = require("mongoose");
var Schema = mongoose.Schema;


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

exports.MyCollectSchema =MyCollectSchema;