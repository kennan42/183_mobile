var MEAP=require("meap");

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../myCollectSchema.js");

/**
*  获取收藏列表 其中默认收藏列表，手动创建数据库
 * 作者：xialin
 * 时间：20170229
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
**/


function run(Param, Robot, Request, Response, IF)
{
     var arg = JSON.parse(Param.body.toString());

     var userId = arg.userId;
     var pageNumber = parseInt(arg.pageNumber);
     var pageSize = parseInt(arg.pageSize);
     var skip = (pageNumber-1)*pageSize;

     var  db = mongoose.createConnection(global.mongodbURL);

     var myCollectModel = db.model("myCollect", sm.MyCollectSchema);

    myCollectModel.find({
        userId : userId,
        status : 1
    }).skip(skip).limit(pageSize).sort({
        "createTime" : 1
    }).exec(function(err, data) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
         db.close();
        if(!err){
               Response.end(JSON.stringify({
                    status : 0,
                    message : "Success",
                    data : data
                }));
         }else{
                 Response.end(JSON.stringify({
                    status : -1,
                    message : "err"
                    
                }));
         }

    });





}

exports.Runner = run;