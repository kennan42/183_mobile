var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");
var async = require("async");
/**
 * 获取代办数量
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param, Robot, Request, Response, IF) { 
    Response.setHeader("Content-type", "text/json;charset=utf-8");
    var conn = mongoose.createConnection(global.mongodbURL);
    var meetBookModel = conn.model("meetBook", sm.MeetBookSchema);

    var arg = JSON.parse(Param.body.toString());
    var state = arg.state;
    var userId = arg.userId; 
    var beginTime = parseInt(arg.beginTime, 10);
    var endTime = parseInt(arg.endTime, 10); 
    if (userId=="") {
        Response.end(JSON.stringify({
            status: "-1",
            msg: "参数传递错误"
        }));
        return
    }
    var query = [];
    var query1 =[];
    if (state == 0) {//未审核   1
        query = [
            {
                    "needApply": 1,
                    "state": 1,
                    "checkUser.userId": userId
            }
        ]; 
         //获取当天时间
            var timestamp =  Date.parse(getDateStartTime(new Date()))/1000;  
            var serventimestamp =(timestamp - 6*86400-1)*1000; 
            query1 = [
            {
                    "needApply": 1,
                    "state": 1,
                    "checkUser.userId": userId,
                    "createTime" : { 
                     $lte : serventimestamp
                   }
                    
            }
        ]; 
    } else if (state == 1) {//已审核
        query = [
            {
                    "needApply": 1,
                    "state": {
                        $in: [2, 3, 5, 6]
                    },
                    "checkUser.userId": arg.userId
                
            }
        ];
                 //获取当天时间
            var timestamp =  Date.parse(getDateStartTime(new Date()))/1000;  
            var serventimestamp =(timestamp - 6*86400-1)*1000; 
            query1 = [
            {
                    "needApply": 1,
                    "state": 1,
                    "checkUser.userId": userId,
                    "createTime" : { 
                     $lte : serventimestamp
                   }
                    
            }
        ]; 
    } 
    
          
             
    async.parallel([
        function (cb) {
            meetBookModel.count(query[0], function (err, count) { 
                if (err) {
                    cb(err, {});
                } else {
                    cb(null, count);
                }

            })
        } ,
        function (cb) {
            meetBookModel.count(query1[0], function (err, count) { 
                if (err) {
                    cb(err, {});
                } else {
                    cb(null, count);
                }

            })
        }   
    ] , function (err, data) {
        conn.close();
        if (err) {
            Response.end(JSON.stringify({
                status: 1,
                msg: "查询失败"
            }));
        } else {
            Response.end(JSON.stringify({
                status: 0,
                msg: "查询成功",
                AllCount: data[0] ,
                ServenAgoCount: data[1] 
            }));
        }
    }); 
}

function getDateStartTime(date){
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
}

exports.Runner = run;
