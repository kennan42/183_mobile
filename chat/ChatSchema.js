var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ChatGroupSchema = new Schema({
    groupId:String,
    groupName:String,
    users:[]
});

var ContactSchema = new Schema({
    userId:String,
    userName:String,
    portraitUrl:String,
    createTime:Number
});

exports.ChatGroupSchema = ChatGroupSchema;
exports.ContactSchema = ContactSchema;