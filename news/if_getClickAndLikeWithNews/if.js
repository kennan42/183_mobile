var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../newsSchema.js");
var async = require("async");
var _ = require("underscore");
var moment = require('moment');
var db = null;


/**
 获取新闻列表 ，点赞点击和收藏
 同时获取新闻
**/


function run(Param, Robot, Request, Response, IF) {

    var arg = JSON.parse(Param.body.toString());
    var cid = arg.cid;
    var userId = arg.userId;
    var url = global.cms+arg.url;

    //是否收藏
    db = mongoose.createConnection(global.mongodbURL);
    //Add your normal handling code
    // var url = "http://cmsdev2.cttq.com/tx/json/fw/tw";
    var option = {
        agent : false,
        method : "GET",
        url : url

    };

    MEAP.AJAX.Runner(option, function(err, res, data) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
       
        
        if(res.statusCode!=404){
            if (!err) {

            var data = JSON.parse(data);
            var listData = data.listData;
            var length = listData.length;
           
            var newdata = [];

            async.each(listData, function(ele, callback) {
                // console.log("++++++++++++++++++++++++");
                //console.log(ele.id);
                //console.log(arg.userId);
                // newdata.push(ele);

                // var newsModel = db.model("newsClick", sm.NewsClickSchema);
                //var newsLikeModel = db.model("newsLike", sm.NewsLikeSchema);
                //var newsCollectModel = db.model("newsCollect", sm.NewsCollectSchema);
                var test1 = getNewsClicks.bind(null, arg, ele, length);
                var test2 = getNewsLikeStatus.bind(null, arg, ele, length);
                var test3 = getNewsCollectStatus.bind(null, arg, ele, length);
                async.parallel([test1, test2, test3], function(err, data) {
                    var number_click = 0;
                    var number_like = 0;
                    var likeStatus = 0;
                    //是否点赞
                    var collectStatus = 0;
                    if (null != data[0] && null != data[0].number_click) {

                        number_click = data[0].number_click;
                    }
                    if (null != data[0] && null != data[0].number_like) {

                        number_like = data[0].number_like;
                    }

                    if (null != data[1] && null != data[1].status) {
                        likeStatus = data[1].status;
                    }

                    if (null != data[2] && null != data[2].status) {
                        collectStatus = data[2].status;
                    }
                    var a = {
                        cid : ele.id,
                        number_click : number_click,
                        number_like : number_like,
                        likeStatus : likeStatus,
                        collectStatus : collectStatus
                    };

                    newdata.push(a);

                    if (newdata.length == length) {
                       
                        callback(newdata);
                    }

                });

            }, function(err) {
                db.close();

                var newlist = hebing(data.listData,newdata);

                Response.end(JSON.stringify({
                    status : 0,
                    message : "查询成功",
                    data : newlist
                 
                }));
            });
            //

        } else {

            Response.end(JSON.stringify({
                status : -1,
                message : "查询失败"
            }));
           }
        }else{
            
            Response.end(JSON.stringify({
                status : -2,
                message : "404"
            }));
            
        }
        

    });

}

function hebing(a, b) {
    //a data  id   b:查询出的list，cid
    var newList = [];

    for (var i = 0; i < a.length; i++) {
        for (var j = 0; j < b.length; j++) {
            if (b[j].cid === a[i].id) {
                //如果等
              
                a[i].number_click = b[j].number_click;
                a[i].number_like = b[j].number_like;
                a[i].likeStatus = b[j].likeStatus;
                a[i].collectStatus = b[j].collectStatus;
               // console.log(a[i]);
               
                newList.push(a[i]);

            }
        };
    };
    return newList;

}

//获取阅读数和点赞总数
function getNewsClicks(arg, ele, newdata, callback) {

    var newsModel = db.model("newsClick", sm.NewsClickSchema);
    newsModel.findOne({
        cid : ele.id
    }, {
        _id : 0,
        cid : -1,
        number_like : -1,
        number_click : -1
    }).exec(function(err, data) {
       
        callback(err, data);

    });

}

//查询是否点赞
function getNewsLikeStatus(arg, ele, newdata, callback) {

    var newsLikeModel = db.model("newsLike", sm.NewsLikeSchema);
    newsLikeModel.findOne({
        "cid" : ele.id,
        userId : arg.userId
    }, {
        "status" : -1
    }).exec(function(err, data) {
       
        callback(err, data);

    });

}

//查询是否收藏
function getNewsCollectStatus(arg, ele, newdata, callback) {

    var myCollectModel = db.model("myCollect", sm.MyCollectSchema);

    myCollectModel.findOne({
        "cid" : ele.id,
        userId : arg.userId
    }, {
        "status" : -1
    }).exec(function(err, data) {
       
        callback(err, data);
    });

}

exports.Runner = run;
