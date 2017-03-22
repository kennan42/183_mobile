var MEAP = require("meap");

function run(Param, Robot, Request, Response, IF) {
    console.log("app.getHistoryVersionOfStandard start");
    Response.setHeader("Content-type", "application/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
    var pageNumber = arg.pageNumber;
    var pageSize = arg.pageSize;
    var platform = arg.platform;
    var startIndex = (pageNumber - 1) * pageSize;
    try {
        var option = {
            CN : "Dsn=mysql-emm",
            sql : "select appId,appName,version,createdAt,description from PkgFileInfo where appId = '" + global.appId 
                    + "' and  platform = '" + platform + "' and pkgStatus = 1 and widgetSwitch = 'T' order by createdAt desc limit " + startIndex + "," + pageSize
        };
        console.log(option.sql);
        MEAP.ODBC.Runner(option, function(err, rows, cols) {
            console.log("app.getHistoryVersionOfStandard end");
            if (!err) {
                Response.end(JSON.stringify({
                    status : '0',
                    data : rows
                }));
            } else {
                Response.end(JSON.stringify({
                    status : '-1',
                    message : 'Error'
                }));
            }
        }, Robot);
    } catch(e) {
        Response.end(JSON.stringify({
            status : '-1',
            message : 'Error'
        }));
    }
}

exports.Runner = run;

