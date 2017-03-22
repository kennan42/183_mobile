var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../newsSchema.js");

/**
 *
 * 新闻添加评论
 * 作者：xialin
 * 时间：20160929
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param, Robot, Request, Response, IF) {

    var arg = JSON.parse(Param.body.toString());

    var cid = "";
    var app_code = arg.app_code||"app";
    var userId = "";
    var userName ="";
    var userUrl = arg.userUrl||"";
    var article = arg.article||"";
    var comment = "";
    
    Response.setHeader("Content-Type", "text/json;charset=utf8");
   
    if (arg.cid != null && arg.cid != '') {
        cid = arg.cid;
    } else {
        Response.end(JSON.stringify({
            status : -1,
            message : "cid不能不空!"
        }));
        return;
    }

    if (arg.userId != null && arg.userId != '') {
        userId = arg.userId;
    } else {
        Response.end(JSON.stringify({
            status : -1,
            message : "用户工号不能不空!"
        }));
        return;

    }
    
    if (arg.userName != null && arg.userName != '') {
        userName = arg.userName;
    } else {
        Response.end(JSON.stringify({
            status : -1,
            message : "用户名不能不空!"
        }));
        return;

    }
    
    
    

    if (arg.comment != null && arg.comment != '') {

        comment = arg.comment;
    } else {
        Response.end(JSON.stringify({
            status : -1,
            message : "评论不能不空!"
        }));
        return;
    }

    var db = mongoose.createConnection(global.mongodbURL);
    var newsModel = db.model("newsComment", sm.NewsCommentSchema);

    var newsEntity= new newsModel({
        cid:cid,
        app_code : app_code,
        userId : userId,
        userName : userName,
        userUrl : userUrl,
        article : article,
        comment : comment,
        createTime : new Date().getTime(),
        data_status : 0
    });



    newsEntity.save(function(err, data) {
        db.close();
        if (!err) {
            Response.end(JSON.stringify({
                status : 0,
                message : "评论成功!"
            }));
        } else {
            Response.end(JSON.stringify({
                status : -1,
                message : "评论失败!"
            }));
        }
    });

}

exports.Runner = run; 