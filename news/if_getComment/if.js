var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../newsSchema.js");

/**
 *
 * 获取添加评论
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
    var cid = arg.cid;

    var db = mongoose.createConnection(global.mongodbURL);
    var newsModel = db.model("newsComment", sm.NewsCommentSchema);

    newsModel.find({"cid":cid,"data_status":0},{_id:0}).sort({"createTime":1}).
    exec(function(err, data) {
        db.close();
        Response.setHeader("Content-Type", "text/json;charset=utf8");
        if (!err) {
            Response.end(JSON.stringify({
                status : 0,
                message : "Success" ,
                data:data
            }));
        } else {
            Response.end(JSON.stringify({
                status : -1,
                message : "err"
            }));
        }

    });

    //Add your normal handling code

}

exports.Runner = run; 