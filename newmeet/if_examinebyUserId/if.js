var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");
var async = require("async");
var util = require("../util.js");
/**
 * 查询会议室已办审核列表
 * 入参:会议室申请人模糊匹配,,
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
    var arg = JSON.parse(Param.body.toString());
    var state = 1;//预定状态
    var userId = arg.userId;//会议室管理员
    var newname = null;//会议室名字
    var pageSize = parseInt(arg.pageSize, 10);
    var pageNum = parseInt(arg.pageNum, 10); 
//判断输入是否为数字
    if (userId==null) {
        Response.end(JSON.stringify({
            status: "-1",
            msg: "参数传递错误"
        }));
        return
    }
    //名字的模糊处理
    if(arg.name!= null && arg.name!= ''){
         newname = new RegExp(arg.name); 
    }
  
    var query = []; 
       if (state == 1) {//已审核
         if(newname==null){
            query = [
             {
                 $match: {
                     needApply: 1,
                     state: {
                         $in: [2, 3, 5, 6]
                     },
                     "checkUser.userId": arg.userId
                 }
             }, {
                 $sort: {
                     createTime: -1
                 }
             }
         ];   
         }else{
           query = [
             {
                 $match: {
                     needApply: 1,
                     state: {
                         $in: [2, 3, 5, 6]
                     },
                     "checkUser.userId": arg.userId,
                     "userName":newname
                 }
             }, {
                 $sort: {
                     checkTime: -1
                 }
             }
         ];  
         } 
     }
 
    if(pageNum||pageSize){
     var skip = (pageNum - 1) * pageSize;
    if (skip < 0) {
        skip = 0
    }
     query.push({
        $skip: skip
    });
    query.push({
        $limit: pageSize
    });   
    } 
    async.parallel([
       /*
        function (cb) {
                   meetBookModel.count(query[0]["$match"], function (err, count) {
                       if (err) { 
                           cb(err, {});
                       } else {
                           cb(null, count);
                       } 
                   })
               },*/
       
        function (cb) { 
            if(pageNum||pageSize){ 
              meetBookModel.aggregate(query, function (err, res) {
                if (err) { 
                    cb(err, {});
                } else {
                    cb(null, res);
                }
            });  
            }else{ 
             meetBookModel.find(query[0]["$match"]).exec(function (err, res1) {
                if (err) { 
                    cb(err, {});
                } else {
                    cb(null, res1);
                }
            }); 
            } 
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
            //
        async.map(data[1], function(item, callback) {  
             util.getpersonmessage(item, Robot, Request, Response, IF, callback)
          }, function(err,results) { //对比并得出值 
               var NEWDATA =  util.cpmparepersondata(data[0],results)
             Response.end(JSON.stringify({
                status: 0,
                msg: "查询成功",
                data:NEWDATA
            }));
                   }); 
        }
    }); 
} 
 
exports.Runner = run; 