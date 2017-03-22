var MEAP = require("meap");
var async = require("async");
var mongoose = require("mongoose");
var ContactSchema = require("../Contact.js");

/**
 * 获取常用联系人列表
 * @author donghua.wang
 * @date 2016年3月5日 09:06
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("contact.getFrequentLinkmanList start");
    Response.setHeader("Content-Type", "text/json;charset=utf-8");

    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var conn = mongoose.createConnection(global.mongodbURL);
    var frequentLinkmanModel = conn.model("contact_frequent_linkman", ContactSchema.FrequentLinkmanSchema);
    //查询常用联系人
    frequentLinkmanModel.find({
        "userId": userId,
        "status": 1
    }, {
        "linkmanId": 1
    }, function(err, data) {
        if (data.length == 0) {
            conn.close();
            console.log("contact.getFrequentLinkmanList end");
            Response.end(JSON.stringify({
                "status": "0",
                "msg": "查询成功",
                "data": []
            }));
        } else {
            var linkmanIds = [];
            for (var i in data) {
                linkmanIds.push(data[i].linkmanId);
            }
            var baseUserModel = conn.model("base_user", ContactSchema.BaseUserSchema);
            var contactUserRemarkModel = conn.model("contact_user_remark", ContactSchema.ContactUserRemarkSchema);
            //var pageNumber = arg.pageNumber;
            //var pageSize = 100;
            //var skip = (pageNumber - 1) * pageSize;
            async.parallel([
                //查询用户信息
                function(cb) {
                    baseUserModel.find({
                        "PERNR": {
                            "$in": linkmanIds
                        },
                        "STAT1": {
                            "$in": ["A", "B", "C", "D"]
                        }
                    }, {
                        "PERNR": 1,
                        "NACHN": 1,
                        "ORGEH": 1,
                        "ORGTX": 1,
                        "STLTX": 1,
                        "photoURL": 1,
                        "syncTime": 1,
                        "photoUpdateTime": 1
                    }).sort({
                        "NACHN": 1
                    }).exec(function(err, data) {
                        cb(err, data);
                    });
                },
                //查询备注
                function(cb) {
                    contactUserRemarkModel.find({
                        "userId": userId
                    }, function(err, data) {
                        cb(err, data);
                    });
                }
            ], function(err, data) {
                conn.close();
                if (err) {
                    console.log("contact.getFrequentLinkmanList end");
                    Response.end(JSON.stringify({
                        "status": "-1",
                        "msg": "查询用户信息失败"
                    }));
                } else {
                    var linkmans = data[0];
                    var remarks = data[1];
                    var rs = [];
                    for (var i in linkmans) {
                        var linkman = linkmans[i].toObject();
                        linkman.remark = "";
                        for (var j in remarks) {
                            var remark = remarks[j];
                            if (linkman.PERNR == remark.linkmanId) {
                                linkman.remark = remark.remark;
                                break;
                            }
                        }
                        rs.push(linkman);
                    }
                    console.log("contact.getFrequentLinkmanList end");
                    Response.end(JSON.stringify({
                        "status": "0",
                        "msg": "查询成功",
                        "data": rs
                    }));
                }
            });
        }
    });
}

exports.Runner = run;
