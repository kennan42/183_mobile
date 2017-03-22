var MEAP=require("meap");
var mongoose = require("mongoose");
var ContactSchema = require("../Contact.js");

//添加用户的常用联系人
function run(Param, Robot, Request, Response, IF)
{
    console.log("contact.addFrequentLinkman start");
    Response.setHeader("Content-Type","text/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var linkmanId = arg.linkmanId;
    var tmpUserId = userId;
    if(tmpUserId.length == 7){
        tmpUserId += "0";
    }
    if(tmpUserId == linkmanId){
        Response.end(JSON.stringify({
                "status":"-1",
                "msg":"不能添加自己为常用联系人"
            }));
        return;
    }
    var times = Date.now();
    
    var conn = mongoose.createConnection(global.mongodbURL);
    var frequentLinkmanModel = conn.model("contact_frequent_linkman",ContactSchema.FrequentLinkmanSchema);
    frequentLinkmanModel.findOne({"userId":userId,"linkmanId":linkmanId,"status":1},function(err,data){
        if(data != null){
            conn.close();
             console.log("contact.addFrequentLinkman end");
            Response.end(JSON.stringify({
                "status":"-1",
                "msg":"你已添加该员工为常用联系人"
            }));
        }else{
			frequentLinkmanModel.update({"userId":userId,"linkmanId":linkmanId},{
				"status":1,
				"createTime":times,
				"deleteTime":0
			},{
				"upsert":true
			},function(err,rs){
				conn.close();
                console.log("contact.addFrequentLinkman end");
                Response.end(JSON.stringify({
                    "status":"0",
                    "msg":"添加成功"
                }));
			});
        }
    });
}

exports.Runner = run;


                                

	

