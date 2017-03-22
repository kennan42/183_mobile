var MEAP = require("meap");
var fs = require("fs");
//var qr = require("qr-image");
function run(Param, Robot, Request, Response, IF) {
    var text = "donghua";
    try {
        var img = qr.image(text);
        img.pipe(fs.createWriteStream("/opt/emm/uploads/bcard/wdh.png"), {}, function(err, data) {
            console.log("====>err,data", err,data);
            Response.end("xxx");
        });

    } catch (e) {
        console.log("====>e", e);
    }
}

exports.Runner = run;

