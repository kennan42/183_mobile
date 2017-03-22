var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");
var async = require("async");
var util = require("../util.js");
/**
 * 查询会议室已办审核列表
 * 入参:根据会议室开始时间查询,
 * 除参:审核列表主数据
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
    var pageSize = parseInt(arg.pageSize, 10);
    var pageNum = parseInt(arg.pageNum, 10);

//判断输入是否为数字 
     if (!userId || isNaN(pageSize) || isNaN(pageNum) || (isNaN(beginTime) && isNaN(endTime))) {
        Response.end(JSON.stringify({
            status: "-1",
            msg: "参数传递错误"
        }));
        return
    } 
    var query = []; 
       if (state == 1) {//已审核
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
     }


if(arg.beginTime!=undefined&&arg.beginTime!=""){
   var beginTime = parseInt(arg.beginTime, 10);
    var endTime = parseInt(arg.endTime, 10);
   if (beginTime) {
        if (!query[0]["$match"].startTime) {
            query[0]["$match"].startTime = {}
        }
        query[0]["$match"].startTime["$gte"] = beginTime;
    }
    
    if (endTime) {
        if (!query[0]["$match"].startTime) {
            query[0]["$match"].startTime = {}
        }
        query[0]["$match"].startTime["$lte"] = endTime;
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
        } ,
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

function cpmparepersondata(data1,data2){
     var newdata = [];
    for(var i in data1){
        var userid =data1[i].userId;
         if(userid.length<8){userid ="0"+userid;}
        for(var j in data2){
            var perner=data2[j].EASY_TAB.item[0].PERNR; 
             if(userid == perner){
                 var person =data2[j].EASY_TAB.item[0];
                 newdata.push({"BOOK":data1[i],"PERNR":{"BUTXT":person.BUTXT,"BUMEN":person.BUMEN}});
                 break; 
            }  
        } 
    }
    return newdata;
}

function getpersonmessage(PERNR, Robot, Request, Response, IF, cb) { 
    var option = {
        method: "POST",
        url: global.baseURL + "/zhr/ZHR_GET_PER_EASY_INFO",
        Cookie: "true",
        agent: "false",
        Enctype: "application/json",
        Body: JSON.stringify({ "P_PERNR":{ "item":[{
                "PERNR":PERNR }]}})
    };

    MEAP.AJAX.Runner(option, function (err, res, data) {
        if (err != null) {
            cb(err, 0);
            return
        }  
        data = JSON.parse(data)
        cb(err, data);
    }, Robot);

}

exports.Runner = run;
 