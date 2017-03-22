var MEAP=require("meap");
var mongoose = require("mongoose");
var async = require("async");
var appversionSchema = require("../BaseVersion.js");

/**
 * 查询版本号，根据平台查询版本信息（ios,android）
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param, Robot, Request, Response, IF)
{
	Response.setHeader("Content-Type", "text/json;charset=utf8");
	var arg = JSON.parse(Param.body.toString());
	var systemtype = arg.systemtype;//IOS /android
	var coon = mongoose.createConnection(global.mongodbURL);
    var appVersionModel = coon.model("app_version", appversionSchema.appversionSchema);
    appVersionModel.find({"systemtype":systemtype}).sort({
        "uploadDate" : -1
    }).exec(function(err,data){
        coon.close();
        if(!err){
            Response.end(JSON.stringify({
                "status" : "0",
                "msg" : "查询成功",
                "data":data
            }));
        }else{
             Response.end(JSON.stringify({
                  "status" : "-1",
                "msg" : "查询失败",
             }));
        }
    });
}

exports.Runner = run;


                                

	

