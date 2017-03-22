var MEAP=require("meap"); 
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js"); 

/**
 * 查询登陆人最近一次登陆信息
 * zrx
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param, Robot, Request, Response, IF)
{
    var arg = JSON.parse(Param.body.toString());
    var db=mongoose.createConnection(global.mongodbURL);
    var MeetBookModel=db.model("meetBook",sm.MeetBookSchema);
    Response.setHeader("Content-type","text/json;charset=utf-8");
   
    MeetBookModel.find({"userId":arg.userId}).sort({"createTime": -1}).limit(1).exec(function(err,data){
        db.close();
        console.log(JSON.stringify(data));
        if(!err){
            if(data[0]!=undefined){
               Response.end(JSON.stringify({
                status:0,
                msg:"查询成功",
                data:{
                    "guishudiId":data[0].guishudiId,
                    "guishudiName":data[0].guishudiName
                } 
            })); 
            }else{
              Response.end(JSON.stringify({
                status:1,
                msg:"未查询到数据",
                 
            }));  
            }
        }else{
             Response.end(JSON.stringify({
                status:-1,
                msg:"查询失败"
            }));
        }
    });
}

exports.Runner = run;


                                

	

