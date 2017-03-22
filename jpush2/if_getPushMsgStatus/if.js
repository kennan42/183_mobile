var MEAP = require("meap");
var mongoose = require("mongoose");
var baseSchema = require("../BasePushSchema.js");

var appUserMsgPushStatusSchema = require("../BasePushSchema.js");
/**
 * 根据工号查找推送设置，如未设置，初始化
 * @author ken
 * @date 2015年11月11日 16:58
 * */

function run(Param, Robot, Request, Response, IF) {

    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;

    if (userId == null) {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "userId is null"
        }));
        return;
    }

    var db = mongoose.createConnection(global.mongodbURL);
    var pushMsgStatusModel = db.model("pushMsgStatus", baseSchema.pushMsgStatusSchema);
    var appUserMsgPushStatusModel = db.model("app_user_msgpush_status", baseSchema.appUserMsgPushStatusSchema);
     var total ='';
    appUserMsgPushStatusModel.findOne({
        userId : userId
    }, {
        status : 1,
        _id : 0
    }).exec(function(err, data) {
        console.log("pushStatus:  " + JSON.stringify(data));
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err) {
            if (data != null && data.status == 0) {
                //结果为0
                   total =0;
            } else {
                  //结果为1
                  total=1;
            }
 
                pushMsgStatusModel.find({
                    userId : userId,
                    status : 1
                }, {
                    msgType : 1,
                    _id : 0
                }).exec(function(err, data) {
                    console.log(JSON.stringify(data));
                    Response.setHeader("Content-type", "text/json;charset=utf-8");
                    if (!err) {
                        console.log(JSON.stringify(data));

                        if (data.length != 0) {

                            var result = [];
                            for (var i = 0; i < data.length; i++) {
                                result.push(data[i].msgType);
                            };

                            Response.end(JSON.stringify({
                                status : 0,
                                msg : "查询成功",
                                result : result,
                                total :total
                            }));

                        } else {
                            //查询为空，则初始化设置数据，并返回结果

                            var rs = ["NEWS", "MeetingRoomBooking", "B2B", "FMS", "EM", "FICO", "Carpool", "HR_VACATION_APPLY", "HR_OVERTIME_APPLY", "HR_SALARY_QUERY"];
                            var time = new Date().getTime();
                            var arg = [];
                            for (var i = 0; i < rs.length; i++) {
                                arg.push({
                                    userId : userId,
                                    msgType : rs[i],
                                    updateTime : time,
                                    status : 1
                                });
                            }

                            pushMsgStatusModel.collection.insert(arg, {
                                ordered : false
                            }, function(err, data) {
                                db.close();

                                if (!err) {

                                    Response.end(JSON.stringify({
                                        status : 1,
                                        msg : "初始化成功",
                                        result : rs,
                                        total :total
                                    }));
                                } else {
                                    Response.end(JSON.stringify({
                                        status : -1,
                                        msg : "初始化失败",
                                        result : rs,
                                        total :total
                                    }));

                                }

                            });

                        }

                    } else {
                        Response.end(JSON.stringify({
                            status : -1,
                            msg : "查询失败",
                            result : data
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

