var MEAP = require("meap");

var mongoose = require("mongoose");
var ContactSchema = require("../Contact.js");

/**
 * 功能：获取乘客或用户详细信息，根据公司
 *
 * 作者：xialin
 * 时间：20160331
 */
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    
    var company =arg.company;
    
    var userId = new RegExp(arg.userId);
    var conn = mongoose.createConnection(global.mongodbURL);
    

    var userModel = conn.model("base_user", ContactSchema.BaseUserSchema);
    userModel.find({
        PERNR : userId
    }, {
         ZZ_TEL : 1,  //手机号
        NACHN : 1,    //姓名
        ORGTX : 1,    //组织
        photoURL:1,  //压缩照片地址
        photoURL2:1, //原始照片地址
        _id : 0

    }).exec(function(err, data) {

        conn.close();
        if (!err) {

            Response.end(JSON.stringify({
                status : 0,
                msgStatus : "S4000103",
                msg : "查询成功",
                data : data
            }));

        } else {

            Response.end(JSON.stringify({
                status : -1,
                msgStatus : "E4000103",
                msg : "查询失败"

            }));

        }
    });

}

exports.Runner = run;

