var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../waitTaskSchema.js");

/**
 *
 * 统一代办排序： 保存排序
 * 作者xialin
 * 时间20160829
 *
 */
function run(Param, Robot, Request, Response, IF) {

    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var saveOrder = arg.saveOrder;
    //要保存的order

    var db = mongoose.createConnection(global.mongodbURL);

    var waitTaskOrderModel = db.model("waitTaskOrder", sm.WaitTaskSchema);

    waitTaskOrderModel.update({
        "userId" : userId
    }, {
        "order" : saveOrder,
        "updateTime" : new Date().getTime()
    }, {
        "upsert" : true
    }, function(err, data) {
        db.close();
        Response.setHeader("Content-type", "text/json;charset=utf-8");
       if(!err){
           Response.end(JSON.stringify({
               status:0,
               message:"保存成功"
           }));
       }else{
           Response.end(JSON.stringify({
               status:-1,
               message:"保存失败"
           }));
           
       }
    });

  
}

exports.Runner = run;
