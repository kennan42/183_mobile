var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../carpoolSchema.js");

/**
 * 点赞功能          //接口废除
   作者：xialin
   时间：2016-01-19
   状态：已完成
   
   入参： userId    评价人id
          userName  评价人姓名
          evaluaterType  评价人类型  1开车人，2乘车人
		  userId2    被评价id
		  userName2  被评价人姓
		  travel     行程ID
 */
var db = null;
var arg = null;
function run(Param, Robot, Request, Response, IF) {

    arg = JSON.parse(Param.body.toString());
    var userIdn = arg.userId;
    //评价人id
    var userNamen = arg.userName;
    //评价人姓名
    var evaluaterTypen = arg.evaluaterType;
    //评价人类型 1：开车人，2：乘车人
    var userId2n = arg.userId2;
    //被评价人id
    var userName2n = arg.userName2;
    //被评价人姓名
    var traveln = arg.travel;
    //旅行id
    db = mongoose.createConnection(global.mongodbURL);
    var CarpoolEvaluateModel = db.model("carPoolEvaluate", sm.CarpoolEvaluateSchema);
    CarpoolEvaluateModel.findOne({
        userId2 : userId2n,
        userId : userIdn,
        travel : traveln
    }).exec(function(err, data) {
        if (!err) {
            if (data == null) {
                //修改信誉
                var CarpoolCreditModel = db.model("carpoolcredit", sm.CarpoolCreditSchema);
                CarpoolCreditModel.findOne({
                    userId : userId2n
                }).exec(function(err, doc) {
                    if (doc != null) {
                        //如果是开车人，credit1+1
                        if (evaluaterTypen == 1) {
                            CarpoolCreditModel.update({
                                userId : userId2n
                            }, {
                                $inc : {
                                    "credit2" : 1
                                }
                            }).exec(function(err, doc) {
                                db.close();
                                if (!err) {
                                    addSupport(Response);
                                } else {
                                    Response.end(JSON.stringify({
                                        status : -1,
                                        msg : "更新失败"
                                    }));
                                }
                            });
                        } else {
                            CarpoolCreditModel.update({
                                userId : userId2n
                            }, {
                                $inc : {
                                    "credit1" : 1
                                }
                            }).exec(function(err, doc) {
                                db.close();
                                if (!err) {
                                    addSupport(Response);
                                } else {
                                    Response.end(JSON.stringify({
                                        status : -1,
                                        msg : "更新失败"
                                    }));
                                }
                            });
                        }
                    } else {
                        //给乘客的赞
                        if (evaluaterTypen == 1) {
                            var CarpoolCreditEntity = new CarpoolCreditModel({
                                userId : userId2n,
                                driveYear : 0,
                                credit1 : 0,
                                credit2 : 1,
                                createAt : new Date().getTime()
                            });
                            CarpoolCreditEntity.save(function(err, doc) {
                                if (!err) {
                                    addSupport(Response);
                                } else {
                                    Response.end(JSON.stringify({
                                        status : -1,
                                        msg : "点赞失败"
                                    }));
                                }
                            });
                        } else {
                            var CarpoolCreditEntity = new CarpoolCreditModel({
                                userId : userId2n,
                                driveYear : 0,
                                credit1 : 1,
                                credit2 : 0,
                                createAt : new Date().getTime()
                            });
                            CarpoolCreditEntity.save(function(err, doc) {
                                if (!err) {
                                    addSupport(Response);
                                } else {
                                    Response.end(JSON.stringify({
                                        status : -1,
                                        msg : "点赞失败"
                                    }));
                                }
                            });
                        }
                    }
                });
            } else {
                Response.end(JSON.stringify({
                    status : -1,
                    msg : "点赞失败"
                }));
            }
        } else {
            Response.end(JSON.stringify({
                status : -1,
                msg : "点赞失败"
            }));
        }
    });

}

/*
 * 点赞记录
 */
function addSupport(res) {
    db = mongoose.createConnection(global.mongodbURL);
    var CarpoolEvaluateModel = db.model("carPoolEvaluate", sm.CarpoolEvaluateSchema);
    var CarpoolEvaluateEntity = new CarpoolEvaluateModel({
        userId : arg.userId,
        userName : arg.userName,
        evaluaterType : arg.evaluaterType,
        userId2 : arg.userId2,
        userName2 : arg.userName2,
        travel : arg.travel
    });
    CarpoolEvaluateEntity.save(function(err, doc) {
        res.setHeader("Content-type", "text/json;charset=utf-8");
        db.close();
        if (!err) {
            console.log("记录成功");
            res.end(JSON.stringify({
                status : 0,
                msg : "记录成功"
            }));
        } else {
            console.log(err);
            res.end(JSON.stringify({
                status : -1,
                msg : "记录失败"
            }));
            return;
        }
    });
}

exports.Runner = run;
