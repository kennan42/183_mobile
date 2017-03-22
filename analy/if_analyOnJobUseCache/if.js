var MEAP = require("meap");
var common = require("../common.js");
var analyOnJobUseCacheService = require("../_service/analyOnJobUseCacheService.js");
/**
 * 在职人员分析，首先从redis获取，如果redis不存在，则从hana查询，并缓存到redis
 * @author donghua.wang
 * @date 2015年8月19日 09:48
 * */
function run(Param, Robot, Request, Response, IF) {
    //console.log(common.ttl);
    Response.setHeader("Content-Type", "text/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    if (userId.length == 7) {
        arg.userId = "0" + userId;
    }
    var currentDate = common.getCurrentDate();
    var queryYear = arg.queryYear;
    var queryMonth = arg.queryMonth;
    var queryDate = common.getQueryDate(queryYear, queryMonth);
    if (queryDate > currentDate) {
        Response.end(JSON.stringify({
            "status": "-1",
            "msg": "无法查询今天以后的数据",
            "data": []
        }));
        return;
    }
    var op = arg.op;
    if (op === undefined || op===null || op === '') {
        Response.end(JSON.stringify({
            "status": "-1",
            "msg": "传递参数错误"
        }));
        return;
    }
    switch (op) {
        case 'analyOnjobCount':
            analyOnJobUseCacheService.analyOnjobCount(arg, Response);
            break;
        case 'analyOnjobSex':
            analyOnJobUseCacheService.analyOnjobSex(arg, Response);
            break;
        case 'analyOnjobSexByPage':
            analyOnJobUseCacheService.analyOnjobSexByPage(arg, Response);
            break;
        case 'analyOnjobEducation':
            analyOnJobUseCacheService.analyOnjobEducation(arg, Response);
            break;
        case 'analyOnjobEducationByPage':
            analyOnJobUseCacheService.analyOnjobEducationByPage(arg, Response);
            break;
        case 'analyOnjobSiling':
            analyOnJobUseCacheService.analyOnjobSiling(arg, Response);
            break;
        case 'analyOnjobSilingByPage':
            analyOnJobUseCacheService.analyOnjobSilingByPage(arg, Response);
            break;
        case 'analyOnjobAge':
            analyOnJobUseCacheService.analyOnjobAge(arg, Response);
            break;
        case 'analyOnjobAgeByPage':
            analyOnJobUseCacheService.analyOnjobAgeByPage(arg, Response);
            break;
        case 'analyOnjobTecAndDuty':
            analyOnJobUseCacheService.analyOnjobTecAndDuty(arg, Response);
            break;
        case 'analyOnjobTecAndDutyByPage':
            analyOnJobUseCacheService.analyOnjobTecAndDutyByPage(arg, Response);
            break;
        default:
            Response.end(JSON.stringify({
                "status": "-1",
                "msg": "传递参数错误"
            }));
    }
}


exports.Runner = run;

