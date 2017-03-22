var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");


/**
 * 得到归宿地查询
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param, Robot, Request, Response, IF)
{
    var db=mongoose.createConnection(global.mongodbURL);
    var MeetGuishudiModel=db.model("meetguishudi",sm.MeetGuishudiSchema);
    Response.setHeader("Content-type","text/json;charset=utf-8");
    
    MeetGuishudiModel.find({"type":1},{"code":1,"name":1},function(err,data){
        db.close();
        if(!err){
            Response.end(JSON.stringify({
                status:0,
                msg:"查询成功",
                data:data
            }));
        }else{
             Response.end(JSON.stringify({
                status:-1,
                msg:"查询失败"
            }));
        }
    }).sort({"code":1});
}

exports.Runner = run;


                                

    

