var MEAP = require("meap");

/**
 * 绑定用户接口，用于消息推送
 * @author donghua.wang
 * @date 2015年06月04日 13:57
 * */
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var option = {
        method : "POST",
        url : global.appInURL + "/push/msg/bindUser",
        Body : arg,
        Cookie : "false",
        Enctype : "application/x-www-form-urlencoded"
    };

    MEAP.AJAX.Runner(option, function(err, res, data) {
        if (!err) {
            var rs = JSON.parse(data);
            var status = rs.status;
            if (status == "ok") {
                Response.end(JSON.stringify({
                    "status" : "0",
                    "msg" : "绑定成功"
                }));
            } else {
                Response.end(JSON.stringify({
                    "status" : "-1",
                    "msg" : "绑定失败"
                }));
            }
        } else {
            console.log("bindUser err-->",err);
            Response.end(JSON.stringify({
                "status" : "-1",
                "msg" : "绑定失败"
            }));
        }
    }, Robot);
}

exports.Runner = run;

