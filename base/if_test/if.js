var MEAP = require("meap");
var path = require("path");
var util = require("../util.js");
function run(Param, Robot, Request, Response, IF) {
    for ( i = 0; i < 10; i++) {
        var pushArg = {
            appId : global.appId,
            platforms : "0,1",
            title : "push test",
            body : "body",
            userCodeListStr : "8103666",
            badgeNum : 3,
            module : "test",
            subModule : "test",
            type : "remind"
        };
        util.pushMsg(pushArg);
    }

    Response.end("/base/test");
}

exports.Runner = run;
