var async = require("async");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ChatSchema = require("../ChatSchema.js");

function run(Param, Robot, Request, Response, IF)
{
    var arg = JSON.parse(Param.body.toString());
    var db = mongoose.createConnection(global.mongodbURL);
    var ContactModel = db.model("chat_contact",ChatSchema.ContactSchema);
    Response.setHeader("Content-type", "text/json;charset=utf-8");
    async.series([
        //判断是否已经添加联系人
        function(callback){
            ContactModel.findOne({"userId":arg.userId},function(err,data){
                if(!err && data != null){
                    db.close();
                    Response.end(JSON.stringify({
                        status:"-1",
                        msg:"该用户已经存在"
                    }));
                    return;
                }else{
                    callback(err,"");
                }
            });
        },
        //添加联系人
        function(callback){
            var contactEntity = new ContactModel({
                "userId":arg.userId,
                "userName":arg.userName,
                "portraitUrl":arg.portraitUrl,
                "createTime":new Date().getTime()
            });
            contactEntity.save(function(err){
                db.close();
                if(!err){
                    Response.end(JSON.stringify({
                        status:"0",
                        msg:"添加成功"
                    }));
                }else{
                    Response.end(JSON.stringify({
                        status:"-1",
                        msg:"添加失败"
                    }));
                }
                return;
            });
        }
    ],function(err,data){
        
    });
}

exports.Runner = run;


                                

	

