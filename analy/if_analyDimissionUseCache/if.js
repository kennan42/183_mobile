var MEAP = require("meap");
var async = require("async");
var REDIS = require("meap_redis");
var common = require("../common.js");
var analyDimissionUseCacheService = require("../_service/analyDimissionUseCacheService.js");
/**
 * 离职人员分析，首先从redis里查询，如果redis不存在，则从hana查询，并缓存到redis
 * @author donghua.wang
 * @date 2015年8月21日 10:35
 * */
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    if (userId.length == 7) {
        arg.userId = "0" + userId;
    }
    Response.setHeader("Content-Type", "text/json;charset=utf8");
    var op = arg.op;
    switch (op) {
        case "tendencyAnaly":
            analyDimissionUseCacheService.tendencyAnaly(arg, Response);
            break;
        case "typeAnaly":
           analyDimissionUseCacheService.typeAnaly(arg, Response);
            break;
        case "typeAnalyByPage":
            analyDimissionUseCacheService.typeAnalyByPage(arg, Response);
            break;
        case "eduAnaly":
            analyDimissionUseCacheService.eduAnaly(arg, Response);
            break;
        case "eduAnalyByPage":
            analyDimissionUseCacheService.eduAnalyByPage(arg, Response);
            break;
        case "silingAnaly":
            analyDimissionUseCacheService.silingAnaly(arg, Response);
            break;
        case "silingAnalyByPage":
            analyDimissionUseCacheService.silingAnalyByPage(arg, Response);
            break;
        default:
            Response.end(JSON.stringify({
                "status": "-1",
                "msg": "传递参数错误"
            }));
    }
}


exports.Runner = run;
