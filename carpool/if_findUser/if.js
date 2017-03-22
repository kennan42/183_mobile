var MEAP = require("meap");

var mongoose = require("mongoose");
var ContactSchema = require("../Contact.js");

/**
 * 功能：根据天晴通讯录查找
 * 模糊查找
 *
 * 作者：xialin
 * 时间：20160331
 */
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    
    var company =arg.company;
    var userName = new RegExp(arg.userName);
    
    
    var conn = mongoose.createConnection(global.mongodbURL);
    var userModel = conn.model("base_user", ContactSchema.BaseUserSchema);

    var userModel = conn.model("base_user", ContactSchema.BaseUserSchema);
    userModel.find({
        NACHN : userName
    }, {
        ZZ_TEL : 1,
        NACHN : 1,
        ORGTX : 1,
        STLTX  :1,
        photoURL :1,
        _id : 0

    }).exec(function(err, data) {

        conn.close();
        if (!err) {

            Response.end(JSON.stringify({
                status : 0,
                msgStatus : "S4000104",
                msg : "查询成功",
                data : data
            }));

        } else {

            Response.end(JSON.stringify({
                status : -1,
                msgStatus : "E4000104",
                msg : "查询失败"

            }));

        }
    });

}

exports.Runner = run;

