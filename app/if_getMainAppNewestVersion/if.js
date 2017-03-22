var MEAP = require("meap");

function run(Param, Robot, Request, Response, IF) {
    console.log("app.getMainAppNewestVersion start");
    var arg = JSON.parse(Param.body.toString());
    var option = {
        CN : "Dsn=mysql-emm",
        sql : " select appId,appName,version from PkgFileInfo where appId = '" + global.mainAppId + "' and platform = '" + arg.platform + "' order by version desc limit 0,1 "
    };
    MEAP.ODBC.Runner(option, function(err, data, cols) {
        console.log("app.getMainAppNewestVersion end");
        if (data.length > 0) {
            Response.end(JSON.stringify({
                "status" : "0",
                "flag":true,
                "data" : data[0]
            }));
        } else {
            Response.end(JSON.stringify({
                "status" : "0",
                "flag":false,
                "data" : "没有升级版本信息"
            }));
        }

    });
}

exports.Runner = run;

