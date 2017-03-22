var MEAP=require("meap");

var mongoose = require("mongoose");
var baseSchema = require("../BasePushSchema.js");
function run(Param, Robot, Request, Response, IF)
{
	var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;

    if (userId == null) {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "userId is null"
        }));
        return;
    }
	var db = mongoose.createConnection(global.mongodbURL);
	 var mainPushStatusModel = db.model("app_user_msgpush_status", baseSchema.appUserMsgPushStatusSchema);
	
	 mainPushStatusModel.findOne({
        userId : userId
    }, {
        status : 1,
        _id : 0
    }).exec(function(err, data) {
        if(!err){
            console.log(data);
               Response.end(JSON.stringify({
                    status : 0,
                    msg : "查询成功",
                    data :data.status
                }));
            
        }else{
            Response.end(JSON.stringify({
                    status : -1,
                    msg : "查询err",
                    data : data.status
                    
                }));
            
        }
        
    });
	
}

exports.Runner = run;


                                

	

