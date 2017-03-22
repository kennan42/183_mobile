var mongoose = require("mongoose");
var Schema = mongoose.Schema;


//存储主数据
var MainDataSchema=new Schema({
    code:Number,//编号
    version:Number,//版本号
    datas:{},//主数据
    datatime:String,//时间戳
    eccversion:String//ecc版本
});

exports.MainDataSchema =MainDataSchema;