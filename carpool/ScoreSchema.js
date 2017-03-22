var mongoose = require("mongoose");
var Schema = mongoose.Schema;


//积分累加Schema
var ScoreAddSchema =new Schema({
    
                 
      userId:String,//用户id
      userName:String,//用户名字
      scoreFrom:String,          //积分来源
      score:Number,             //积分点数
      updateTime:Number         //积分updatetime
                  
    
});

exports.ScoreAddSchema =ScoreAddSchema;