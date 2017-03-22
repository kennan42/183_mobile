/**
 *企信数据模型
 * @author donghua.wang
 * @date 2015年9月22日 13:28
 *  */

var mongoose = require("mongoose");
var Schema =  mongoose.Schema;

//群组(qx_group)
var qxGroupSchema = new Schema({
    groupId:String,        //群id
    groupName:String,   //群名称
    groupStatus:Number,//1正常  2解散
    createUserId:String,   //创建用户ID
    createUserName:String,  //创建用户姓名
    createTime:Number,
    deleteTime:Number
});

//群组成员(qx_group_user)
var qxGroupUserSchema = new Schema({
    groupId:String,
    userId:String,
    userName:String,
    userStatus:Number,//1正常  2删除  3退出  4解散
    role:Number,//1群主   2管理员   3普通用户
    inviteUser:String,//邀请人
    joinTime:Number,//入群时间
    leaveTime:Number//离群时间
});

//企信操作日志(qx_op_log)
var qxOpLogSchema = new Schema({
    userId:String,
    arg:Object,
    msg:String,
    opTime:Number
});

//企信通讯录(qx_contact)
var qxContactSchema = new Schema({
    userId:String,
    groupId:String,
    group:{
        type:Schema.Types.ObjectId,
        ref:"qx_group"
    },
    status:Number,//1正常     0删除
    createTime:Number,
    deleteTime:Number
});

//企信注册（qx_regieter）
var qxRegisterSchema = new Schema({
    userId:String,
    nickName:String,
    createTime:String
});

exports.qxGroupSchema=qxGroupSchema;
exports.qxGroupUserSchema=qxGroupUserSchema;
exports.qxOpLogSchema=qxOpLogSchema;
exports.qxContactSchema=qxContactSchema;
exports.qxRegisterSchema=qxRegisterSchema;