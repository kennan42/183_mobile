var MEAP = require("meap");
var mongoose = require("mongoose");
var baseSchema = require("../BasePushSchema.js");

/**
 * 根据工号查找推送设置，如未设置，初始化2,使用wangdonghua数据库表
 * @author ken
 * @date 2015年11月16日 14:58
 * */

function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;

    var rs = ["NEWS", "MeetingRoomBooking", "B2B", "FMS", "EM", "FICO", "Carpool", "HR_VACATION_APPLY", "HR_OVERTIME_APPLY", "HR_SALARY_QUERY"];
    if (userId == null) {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "userId is null"
        }));
        return;
    }

    var db = mongoose.createConnection(global.mongodbURL);
    var appUserMessageModule = db.model("app_user_message_module", baseSchema.appUserMessageModuleSchema);
    var appUserMsgPushStatusModel = db.model("app_user_msgpush_status", baseSchema.appUserMsgPushStatusSchema);
    var total = '';
    appUserMsgPushStatusModel.findOne({
        userId : userId
    }, {
        status : 1,
        _id : 0
    }).exec(function(err, data) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err) {
            if (data != null && data.status == 0) {
                //结果为0
                total = 0;
            } else {
                //结果为1
                total = 1;
            }

            appUserMessageModule.find({
                userId : userId
            }, {
                moduleCode : 1,
                status : 1,
                _id : 0
            }).exec(function(err, data) {
                if (!err) {
                   
                    var result = [];

                    for (var i in rs) {
                        var moduleCode = rs[i];

                        for (var j in data) {
                            if (data[j].moduleCode == moduleCode && data[j].status == 0) {
                                //移除掉此时rs的值
                                rs.splice(i, 1);
                                i--;
                                break;
                            }
                        }
                    }

                    console.log(JSON.stringify(rs));

                    Response.end(JSON.stringify({
                        status : 0,
                        msg : "查询成功 ",
                        result : rs,
                        total : total

                    }));

                } else {
                    Response.end(JSON.stringify({
                        status : -1,
                        msg : "查询失败",
                        result : rs
                    }));

                }

            });

        } else {
            Response.end(JSON.stringify({
                status : -1,
                msg : "查询失败",
                result : []
            }));
        }

    });

}

exports.Runner = run;

