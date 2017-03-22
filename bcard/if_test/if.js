var MEAP = require("meap");
var gm = require('gm').subClass({
    imageMagick : true
});
function run(Param, Robot, Request, Response, IF) {
    var filename = Date.now() + ".png";
    var output = "/opt/emm/uploads/bcard/images/" + filename;
    gm('/opt/emm/uploads/bcard/first-template.png')
    .font("/etc/fonts/bcard/msyh.ttf", 50).drawText(200, 200, "王东华")
    .write(output, function(err) {
        console.log(err);
        Response.end(global.nginxURL + "uploads/bcard/images/" + filename);
    });

}

exports.Runner = run;

