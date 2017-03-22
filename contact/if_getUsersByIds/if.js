var MEAP = require("meap");
var mongoose = require("mongoose");
var contactSchema = require("../Contact.js");

/**
 * 根据员工工号数组查询员工信息
 * @author donghua.wang
 * @date 2016年1月22日 08:44
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("contact.getUsersByIds start");
    Response.setHeader("Content-Type", "text/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
    var userIds = arg.userIds;
    userIds = handleUserIds(userIds);

    var conn = mongoose.createConnection(global.mongodbURL);
    var baseUserModel = conn.model("base_user", contactSchema.BaseUserSchema);
    baseUserModel.find({
        "PERNR": {
            $in: userIds
        }
    }, {
        "PERNR": 1,
        "NACHN": 1,
        "GESCH_T": 1,
        "ORGEH": 1,
        "ORGTX": 1,
        "PLSTX": 1,
        "photoStatus": 1,
        "photoURL": 1,
        "photoURL2": 1,
        "photoNewURL": 1,
        "photoNewStatus": 1
    }, function(err, data) {
        conn.close();
        console.log("contact.getUsersByIds end");
        if (data.photoNewStatus != null) {

            data.photoURL = data.photoNewURL;
            data.photoURL2 = data.photoNewURL;
        }
        Response.end(JSON.stringify({
            "status": "0",
            "data": data
        }));
    });
}

function handleUserIds(userIds) {
    var rs = [];
    for (var i in userIds) {
        var userId = userIds[i];
        if (userId.length == 7) {
            userId = "0" + userId;
        }
        rs.push(userId);
    }
    return rs;
}

exports.Runner = run;
