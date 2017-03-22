var MEAP = require("meap");

function run(Param, Robot, Request, Response, IF) {
    var longitude = Param.params.longitude;
    var latitude = Param.params.latitude;
    var option = {
        method : "GET",
        url : "http://10.10.1.183:808/web/baiduTest.html?longitude=" + longitude + "&latitude=" + latitude, //请求地址  用法同ajax
        Cookie:true
    };
    MEAP.WEBRW.Runner(option, function(err, res, data, page) {
        if (!err) {
            var fileName = longitude + "_" + latitude + ".png";
            page.viewportSize = {
                width : 1024,
                height : 768
            };
            setTimeout(function() {
                page.render('/opt/emm/uploads/qx/' + fileName);
                Response.end(JSON.stringify({
                    "status" : "0",
                    "url" : global.nginxURL + "uploads/qx/" + fileName
                }));
                page.exit();
            }, 2000);
           

        } else {
            Response.end(JSON.stringify({
                "status" : "-1"
            }));
            page.exit();
        }
    }, Robot, function(des, page) {
        return des;
    });
}

exports.Runner = run;

