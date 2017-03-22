var mongoose = require("mongoose");
var Schema = mongoose.Schema;

//qx_user_register_info
var UserRegisterInfo = new Schema({
    userId:String,
    password:String,
    nickName:String
});

exports.UserRegisterInfo=UserRegisterInfo;