var MEAP = require("meap");
var mongoose = require("mongoose");
var baseSchema = require("../BasePushSchema.js");
/**
 * 初始设置 推送消息模块
 * @author ken
 * @date 2015年11月11日 16:58
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("-----savePushMsgStatus");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var msgTypeArray = arg.msgTypeArray;


   
    if (userId == null) {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "userId is null"
        }));
        return;
    }

    if (msgTypeArray == null) {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "msgTypeArray is null"
        }));
        return;
    }

    var db = mongoose.createConnection(global.mongodbURL);
    var pushMsgStatusModel = db.model("pushMsgStatus", baseSchema.pushMsgStatusSchema);
    
    var rs = [];
    var time = new Date().getTime();
   
    for (var i = 0; i < msgTypeArray.length; i++) {
        rs.push({
        userId :userId,
        msgType : msgTypeArray[i],
        updateTime : time,
        status : 1
    });

};



pushMsgStatusModel.collection.insert(rs, {
    ordered : false
}, function(err, data) {
    db.close();
    if (!err) {

        Response.end(JSON.stringify({
            status : 0,
            msg : "保存成功"

        }));
    } else {
        Response.end(JSON.stringify({
            status : -1,
            msg : "保存失败"
        }));

    }

});
}

exports.Runner = run;

