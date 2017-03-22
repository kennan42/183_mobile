var MEAP=require("meap");
var baseUserService = require("../_service/baseUserService.js");

function run(Param, Robot, Request, Response, IF)
{
    console.log("从baseUser表中批量创建环信用户开始:"); 
    baseUserService.createEasemobUsersFromBaseUsers(function(err,data){
        console.log("从baseUser表中批量创建环信用户结束."); 
        Response.end("从baseUser表中批量创建环信用户结束."); 
    });
}

exports.Runner = run;