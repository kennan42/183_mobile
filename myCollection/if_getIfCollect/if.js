var MEAP=require("meap");

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../myCollectSchema.js");

/**
*  获取是否收藏
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
     var cid =arg.cid;

     var  db = mongoose.createConnection(global.mongodbURL);

     var myCollectModel = db.model("myCollect", sm.MyCollectSchema);

    myCollectModel.findOne({
        userId : userId,
        cid : cid
    }).exec(function(err, data) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
         db.close();
        if(!err){
             if(null!=data&&data.status==1){
                Response.end(JSON.stringify({
                    status : 0,
                    message : "Success",
                    collectStatus : data.status
                }));
             }else{
                 Response.end(JSON.stringify({
                    status : 0,
                    message : "Success",
                    collectStatus : 0
                }));
             }
               
         }else{
                 Response.end(JSON.stringify({
                    status : -1,
                    message : "err"
                    
                }));
         }

    });





}

exports.Runner = run;