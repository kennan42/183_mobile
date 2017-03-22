var MEAP = require("meap");
var cp = require("child_process");
var async = require("async");

function run(Param, Robot, Request, Response, IF) {
    var headers = Request.headers;
    var host = headers.host;
    if (host.indexOf("localhost") == -1) {
        Response.end("not auth");
        return;
    }
    Response.end("over");

    async.parallel([
        function(cb) {
            var option = {
                CN : "Dsn=mysql-emm",
                sql : "delete from MessageInfo"
            };
            MEAP.ODBC.Runner(option, function(err, rows, cols) {
                 cb(null,null);
            }, Robot);
        },
        function(cb) {
            var filePath = "/opt/emm/uploads/bcard/images/view*.png";
            var cmd = "rm -rf " + filePath;
            cp.exec(cmd,function(err,data){
                cb(null,null);
            });
        }
    ], function(err, data) {
        console.log("month task over");
    });
}

exports.Runner = run;

