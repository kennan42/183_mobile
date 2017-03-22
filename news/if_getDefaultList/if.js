var MEAP = require("meap");

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../newsSchema.js");
var async = require("async");
/**
 *
 * 获取新闻收藏列表（默认的新闻）
 * 作者：xialin
 * 时间：20160929
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
var db = null;
function run(Param, Robot, Request, Response, IF) {

    var arg = JSON.parse(Param.body.toString());

   /* var userId = arg.userId;*/

    db = mongoose.createConnection(global.mongodbURL);
    var newsCollectModel = db.model("newsCollect", sm.NewsCollectSchema);

    newsCollectModel.find({//为了在收藏中默认查出两条新闻
        userId : "默认",
        status : 1
    }, {

        _id : 0

    }).sort({
        "createTime" : 1
    }).exec(function(err, data) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        console.log(data);
        if (!err) {

            var length = data.length;
            var newdata = [];
            var list = data;

            if (length >= 0) {

                async.each(data, function(ele, callback) {
                    var test1 = getNewsClicks.bind(null, arg, ele, length);
                    var test2 = getNewsLikeStatus.bind(null, arg, ele, length);

                    async.parallel([test1, test2], function(err, data) {
                        var number_click = 0;
                        var number_like = 0;
                        var likeStatus = 0;
                        //是否点赞

                        if (null != data[0] && null != data[0].number_click) {

                            number_click = data[0].number_click;
                        }
                        if (null != data[0] && null != data[0].number_like) {

                            number_like = data[0].number_like;
                        }

                        if (null != data[1] && null != data[1].status) {
                            likeStatus = data[1].status;
                        }

                        var a = {
                            cid : ele.cid,
                            number_click : number_click,
                            number_like : number_like,
                            likeStatus : likeStatus

                        };

                        newdata.push(a);

                        if (newdata.length == length) {

                            callback(newdata);
                        }

                    });

                }, function(err) {
                    db.close();

                    var d = hebing(list, newdata);
                    Response.end(JSON.stringify({
                        status : 0,
                        message : "Success",
                        data : d
                    }));

                });

            } else {
                Response.end(JSON.stringify({
                    status : 0,
                    message : "Success",
                    data : []
                }));
            }

            //  Response.end(JSON.stringify({status:0, message:"Success",data:data}));
        } else {
            //  Response.end(JSON.stringify({status:-1, message:"err"}));
        }
    });

    //Add your normal handling code

}

function hebing(a, b) {
    //a data  id   b:查询出的list，cid
    var newList = [];
    console.log("a", a);
    console.log("b", b);
    for (var i = 0; i < a.length; i++) {
        for (var j = 0; j < b.length; j++) {
            if (a[i].cid === b[j].cid) {
                //如果等

                newList.push({
                    cid : a[i].cid,
                    userId : a[i].userId,
                    status : a[i].status,
                    createTime : a[i].createTime,
                    newsTime : a[i].newsTime,
                    iconUrl : a[i].iconUrl,
                    publisher : a[i].publisher,
                    article : a[i].article,
                    newsUrl : a[i].newsUrl,
                    number_click : b[j].number_click,
                    number_like : b[j].number_like,
                    likeStatus : b[j].likeStatus,
                    ifdefault:1     //是否默认 0为否，1位是
                });

            }
        };
    };
    return newList;

}

//获取阅读数和点赞总数
function getNewsClicks(arg, ele, newdata, callback) {

    var newsModel = db.model("newsClick", sm.NewsClickSchema);
    newsModel.findOne({
        cid : ele.cid
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
        "cid" : ele.cid,
        userId : arg.userId
    }, {
        "status" : -1
    }).exec(function(err, data) {

        callback(err, data);

    });

}

exports.Runner = run;
