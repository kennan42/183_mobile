var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");  

/**
 * 会议室提前结束
 * zrx 
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    Response.setHeader("Content-type", "text/json;charset=utf-8");
    var db = mongoose.createConnection(global.mongodbURL);
    var meetBookModel = db.model("meetBook", sm.MeetBookSchema); 
    meetBookModel.find({ _id : arg.meetBookId},function(err,data){
        if(!err){
            var userTimes =(new Date().getTime()-data[0].startTime)/3600000; 
            meetBookModel.update({  _id : arg.meetBookId }, {
                                     state : 5,
                                     endTime:new Date().getTime(),
                                      clearOverTime:new Date().getTime(),
                                     userTimes:userTimes.toFixed(1)
                                    }, function(err) { 
                                      db.close();
                                     if (!err) {
                                      Response.end(JSON.stringify({
                                                   status : "0",
                                                   msg : "提交成功"
                                                        })); 
                                     } else { 
                                      Response.end(JSON.stringify({
                                                   status : "-1",
                                                   msg : "提交失败"
                                                        }));
                                      }
                             });  
        }else{
            db.close();
            Response.end(JSON.stringify({
                status : "-1",
                msg : "查询失败"
            }));  
        }
    }); 
}

exports.Runner = run;
 
