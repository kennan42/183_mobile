var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../waitTaskSchema.js");
/**
 *
 *统一代办排序： 根据工号id获取排序
 * 作者xialin
 * 时间20160829
 *
 */
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
     //默认排序
    var defaultOrder =["cost","selfService","CRM-B2B","docPlatform","meetroom","train","IT-Service"]; 
     
    var db = mongoose.createConnection(global.mongodbURL);

    var waitTaskOrderModel = db.model("waitTaskOrder", sm.WaitTaskSchema);

    waitTaskOrderModel.findOne({
        userId : userId
    },{order:1,_id:0}).exec(function(err, data) {
        
        db.close();
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err) {
            console.log(data);
            if(data){
                
                Response.end(JSON.stringify({
                status : 0,
                order : data.order
                }));
            }else{
                Response.end(JSON.stringify({
                status : 0,
                order : defaultOrder
                }));
            }
           

        } else {
            Response.end(JSON.stringify({
                status : -1,
                message : "查询出错"
            }));
        }
    });

}

exports.Runner = run; 