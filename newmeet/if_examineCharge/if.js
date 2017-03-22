var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");
var async = require("async");
var util = require("../util.js");
/**
 * 查询会议室代办审核列表
 * 除参:审核列表主数据,审核列表数量,去重的短描述集合
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
    var MeetRoomModel = conn.model("meetRoom",sm.MeetRoomSchema); 
    var arg = JSON.parse(Param.body.toString());
    var state = 0;//预定状态
    var userId = arg.userId;//会议室管理员  
    var beginTime = parseInt(arg.beginTime, 10);
    var endTime = parseInt(arg.endTime, 10);
//判断输入是否为数字
    if (userId==null||userId==''||isNaN(userId)) {
        Response.end(JSON.stringify({
            status: "-1",
            msg: "参数传递错误"
        }));
        return
    }
    
    var query = [];
    if (state == 0) {//未审核   1 
          query = [
            {
                $match: {
                    needApply: 1,
                    state: 1,
                    "checkUser.userId": userId
                }
            }, {
                $sort: {
                   // userName2: 1, 
                    createTime: 1
                }
            }
        ];   
    }  
     console.log("====================================");
    if (beginTime) {
        if (!query[0]["$match"].checkTime) {
            query[0]["$match"].checkTime = {}
        }
        query[0]["$match"].checkTime["$gte"] = beginTime;
    }
    
    if (endTime) {
        if (!query[0]["$match"].checkTime) {
            query[0]["$match"].checkTime = {}
        }
        query[0]["$match"].checkTime["$lte"] = endTime;
    }
    console.log(11111111111111);
    async.parallel([ 
        function (cb) {
             meetBookModel.find(query[0]["$match"]).exec(function (err, res1) {
                if (err) { 
                    cb(err, {});
                } else {
                    cb(null, res1);
                }
            });  
        },
         function(cb){//去重查询
             meetBookModel.distinct("shortName",query[0]["$match"], function (err, res1) {
                 if (err) {
                     cb(err, {});
                 } else {
                     cb(null, res1);
                 }
             });
         },
         function(cb){
              MeetRoomModel.find({"admin.userId":userId},{_id: 1, servicePersonal: 1,technicist:1},function(err,res1){ 
                   if (err) {
                     cb(err, {});
                 } else { 
                     cb(null, res1);
                 }
             });
         },
         function(cb){//去重查询
             meetBookModel.distinct("userId",query[0]["$match"], function (err, res1) {
                 if (err) {
                     cb(err, {});
                 } else {
                     cb(null, res1);
                 }
             });
         }  
    ], function (err, data) {
        conn.close();
        if (err) {
            Response.end(JSON.stringify({
                status: 1,
                msg: err
            }));
        } else { 
            //根据data[0]和data[2]数据对比得到整合的数据打他 
        var newdata = util.comparedata(data[0],data[2]);
        //循环遍历data[0]中的预定人员的的工号得到部门信息
        async.map(data[3], function(item, callback) { 
         
        util.getpersonmessage(item, Robot, Request, Response, IF, callback)
          }, function(err,results) { 
                
            //对比并得出值
            var NEWDATA = util.cpmparepersondata(newdata, results);
            Response.end(JSON.stringify({
                status : 0,
                msg : "查询成功",
                data1 : data[1],
                data2 : NEWDATA
            })); 

                   });
           
        }
    }); 
}
 
exports.Runner = run;
 
