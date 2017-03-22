var MEAP = require("meap");
var mongoose = require("mongoose");
var async = require("async");
var ContactSchema = require("../Contact.js");

/**
 * 添加联系人备注
 * @author donghua.wang
 * @date 2015年8月27日 17:33
 * */
function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type", "text/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var linkmanId = arg.linkmanId;
    var remark = arg.remark;
	var id = null;
    var conn = mongoose.createConnection(global.mongodbURL);
    var userRemarkModel = conn.model("contact_user_remark", ContactSchema.ContactUserRemarkSchema);
    async.series([
    //判断备注是否已经存在
	/*
    function(cb) {
        userRemarkModel.findOne({
            "userId" : userId,
            "remark" : remark
        }, function(err, data) {
            if (data != null) {//已经设置过该备注
                conn.close();
                Response.end(JSON.stringify({
                    "status" : "-1",
                    "msg" : "已经将其他人设置了该备注信息"
                }));
            } else {
                cb(null, "");
            }
        });
    },*/
	//查询被修改的联系人主键
	function(cb){
		var userModel = conn.model("base_user",ContactSchema.BaseUserSchema);
		userModel.findOne({"PERNR":linkmanId},function(err,data){
			if(data == null){
				conn.close();
				Response.end(JSON.stringify({
					"status":"-1",
					"msg":"查询用户信息失败"
				}));
			}else{
				id = data._id;
				cb(null,"");
			}
		});
	},
    //修改联系人备注
    function(cb) {
        userRemarkModel.update({
            "userId" : userId,
            "linkmanId" : linkmanId
        }, {
            "remark" : remark,
			"user":id
        },{"upsert":true}, function(err) {
            conn.close();
            cb(null,"");
        });
    }], function(err, data) {
            Response.end(JSON.stringify({
                    "status" : "0",
                    "msg" : "添加备注成功"
                }));
    });
}

exports.Runner = run;

