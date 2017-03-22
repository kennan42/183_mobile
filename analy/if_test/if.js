var MEAP=require("meap");
var util = require("../../base/util.js");

function run(Param, Robot, Request, Response, IF)
{
    var data = {
        endMonth:"2014-5-12",
        startMonth:"2014-5-11",
        userId:'14050593',
        deptName:"it",
        deptCode:"1234"
    };
    var sql = util.makeSql(global.sqlMaps.dimission.tendencyAnaly,data);
    Response.end(sql);
}

exports.Runner = run;