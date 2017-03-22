var MEAP = require("meap");
var mongoose = require("mongoose");
var qxSchema = require("../qxSchema.js");


/**
 * 
 * 判断群组是否已经保存到通讯录
 */
function run(Param, Robot, Request, Response, IF)
{
    console.log("qx.hasSavedToContact start");
    Response.setHeader("Content-Type", "application/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var groupId = arg.groupId;
    var conn = mongoose.createConnection(global.mongodbURL);
    var contactModel = conn.model("qx_contact", qxSchema.qxContactSchema);
    contactModel.findOne({"userId":userId,"groupId":groupId,"status":1},function(err,doc){
        conn.close();
         console.log("qx.hasSavedToContact end");
         if(doc != null){
             Response.end(JSON.stringify({
                 "status":"0",
                 "hasSaved":true
             }));
         }else{
             Response.end(JSON.stringify({
                 "status":"-1",
                 "hasSaved":false
             }));
         }
    });
}

exports.Runner = run;


                                

	

