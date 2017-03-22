var MEAP = require("meap");
var path = require("path");
var fs = require('fs');
var gm = require("gm");
var imageMagick = gm.subClass({
    imageMagick : true
});
var async = require("async");

/**
 * 和1的区别，不再请求webservice接口
 * */
var rs = null;
function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type","text/json;charset=utf8");
    rs = [];
    var arg = JSON.parse(Param.body.toString());
    var userIds = arg.userIds;
    getPhotos(0, userIds, Response, IF);
}

function getPhotos(i, userIds, Response, IF) {
    i = i || 0;
	if (i < userIds.length) {
    var userId = userIds[i];
    if(userId.length == 8 && userId.indexOf("0") == 0){
        userId = userId.substr(1);
    }
    var url = global.nginxURL + "uploads/compressed_" + userId + ".jpg";
        var option = {
           agent:false,
            method : "GET",
            url : url,
            Cookie : "true"
        };
        MEAP.AJAX.Runner(option, function(err, res, data) {
            if (!err && res.statusCode == 200) {
                rs.push({
                    "status" : "0",
                    "msg" : "获取员工照片成功",
                    "userId" : userIds[i],
                    "url" : url
                });
            } else {
                rs.push({
                    "status" : "-1",
                    "msg" : "该员工没有照片",
                    "userId" : userIds[i],
                });
            }
            i++;
            getPhotos(i, userIds, Response, IF);
        });
    } else {
        Response.end(JSON.stringify({
            "data" : rs
        }));
    }
}

exports.Runner = run;

