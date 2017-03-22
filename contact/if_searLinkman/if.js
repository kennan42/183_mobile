var MEAP = require("meap");
var mongoose = require("mongoose");
var async = require("async");
var strcmp = require("strcmp");
var contactSchema = require("../Contact.js");

/** 
 * 模糊搜索联系人，所户条件为：姓名，拼音，简拼，部门，手机后四位，备注
 * */
var keyWord = null;
function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type", "text/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    keyWord = arg.keyWord;
    keyWord = keyWord.toUpperCase();
    var userId = arg.userId;
    var pageNumber = arg.pageNumber;
    if (pageNumber == null) {
        pageNumber = 1;
    }
    var pageSize = arg.pageSize;
    if (pageSize == null) {
        pageSize = 10;
    }
    var startIndex = (pageNumber - 1) * pageSize;
    var endIndex = pageNumber * pageSize;
    var conn = mongoose.createConnection(global.mongodbURL);
    var userModel = conn.model("base_user", contactSchema.BaseUserSchema);
    var userRemarkModel = conn.model("contact_user_remark", contactSchema.ContactUserRemarkSchema);
    var userIds = [];
    //搜索结果的用户id数组，用于查询图片
    async.parallel([
    //对用户表进行查询
    function(cb) {
        var orArr = [];
        var regExp = new RegExp(keyWord);
        var regExp2 = new RegExp("^" + keyWord)
        var numReg = /\d+/gi;
        orArr.push({
            "NACHN" : regExp
        });
        orArr.push({
            "VORNA" : regExp2
        });
        orArr.push({
            "INITS" : regExp2
        });
       // orArr.push({
        //    "ORGTX" : regExp
       // });
        if (numReg.test(keyWord) && keyWord.length == 4) {
            var telSufReg = new RegExp(keyWord + "$");
            orArr.push({
                "ZZ_TEL" : telSufReg
            });
        }
        userModel.find({
            "STAT1" : {
                "$in" : ["A", "B", "C", "D"]
            },
            "$or" : orArr
        }).exec(function(err, data) {
            if (err) {
                console.log(err, "模糊搜索用户失败");
            }
            cb(err, data);
        });
    },
    //对备注表进行查询
    function(cb) {
        if (keyWord == "") {
            cb(null, []);
        } else {
            var regExp = new RegExp(keyWord,"i")
            userRemarkModel.find({
                "userId" : userId,
                "remark" : regExp
            }).populate("user").exec(function(err, data) {
                if (err) {
                    console.log(err, "查询备注信息失败");
                }
                cb(err, data);
            });
        }

    }], function(err, data) {
        if (err) {
            conn.close();
            Response.end(JSON.stringify({
                "status" : "-1",
                "msg" : "查询失败"
            }));
        } else {
            var users = data[0];
            var remarks = data[1];
            var rs = handleResult(users, remarks, keyWord);
            var length = rs.length;
            if (startIndex >= length) {
                rs = [];
            } else {
                rs = rs.slice(startIndex, endIndex);
            }
            userIds = getUserIds(rs);
            var remark = null;
            if (userIds.length >= 0) {
                async.parallel([
                //查询备注
                function(cb) {
                    userRemarkModel.find({
                        "userId" : userId,
                        "linkmanId" : {
                            "$in" : userIds
                        }
                    }, {
                        "linkmanId" : 1,
                        "remark" : 1
                    }, function(err, data) {
                        remark = data;
                        cb(null, "");
                    });
                }], function(err, data) {
					conn.close();
                    Response.end(JSON.stringify({
                        "status" : "0",
                        "data" : rs,
                        "remark" : remark
                    }));
                    addAppFuncUselog(userId);
                });

            } else {
                conn.close();
                Response.end(JSON.stringify({
                    "status" : "-1",
                    "msg" : "没有查询到数据"
                }));
            }
        }
    });
}

/**
 *处理用户信息和备注信息，如果用户信息PERNR和remarks里的linkmanId相等，
 *则为同一员工
 */
function handleResult(users, remarks, keyWord) {
    var arr = [];
    for (var i in remarks) {
        var item = remarks[i];
        arr.push({
            "userId" : item.linkmanId,
            "userName" : item.user.NACHN,
            "VORNA" : item.user.VORNA,
            "INITS" : item.user.INITS,
            "ORGEH" : item.user.ORGEH,
            "ORGTX" : item.user.ORGTX,
            "ZZ_TEL" : item.user.ZZ_TEL,
            "ZZ_TEL_VIS" : item.user.ZZ_TEL_VIS,
            "ZZ_GS" : item.user.ZZ_GS,
            "ZZ_GST" : item.user.ZZ_GST,
            "ZZ_JG1" : item.user.ZZ_JG1,
            "ZZ_JG1T" : item.user.ZZ_JG1T,
            "ZZ_JG2" : item.user.ZZ_JG2,
            "ZZ_JG2T" : item.user.ZZ_JG2T,
            "ZZ_JG3" : item.user.ZZ_JG3,
            "ZZ_JG3T" : item.user.ZZ_JG3T,
            "ZZ_JG4" : item.user.ZZ_JG4,
            "ZZ_JG4T" : item.user.ZZ_JG4T,
            "ZZ_JG5" : item.user.ZZ_JG5,
            "ZZ_JG5T" : item.user.ZZ_JG5T,
            "PLANS" : item.user.PLANS,
            "PLSTX" : item.user.PLSTX,
            "STELL" : item.user.STELL,
            "STLTX" : item.user.STLTX,
			"photoStatus":item.user.photoStatus,
			"photoURL":item.user.photoURL,
			"photoURL2":item.user.photoURL2,
			"photoUpdateTime":item.user.photoUpdateTime
        });
    }
    for (var j in users) {
        var item = users[j];
        arr.push({
            "userId" : item.PERNR,
            "userName" : item.NACHN,
            "VORNA" : item.VORNA,
            "INITS" : item.INITS,
            "ORGEH" : item.ORGEH,
            "ORGTX" : item.ORGTX,
            "ZZ_TEL" : item.ZZ_TEL,
            "ZZ_TEL_VIS" : item.ZZ_TEL_VIS,
            "ZZ_GS" : item.ZZ_GS,
            "ZZ_GST" : item.ZZ_GST,
            "ZZ_JG1" : item.ZZ_JG1,
            "ZZ_JG1T" : item.ZZ_JG1T,
            "ZZ_JG2" : item.ZZ_JG2,
            "ZZ_JG2T" : item.ZZ_JG2T,
            "ZZ_JG3" : item.ZZ_JG3,
            "ZZ_JG3T" : item.ZZ_JG3T,
            "ZZ_JG4" : item.ZZ_JG4,
            "ZZ_JG4T" : item.ZZ_JG4T,
            "ZZ_JG5" : item.ZZ_JG5,
            "ZZ_JG5T" : item.ZZ_JG5T,
            "PLANS" : item.PLANS,
            "PLSTX" : item.PLSTX,
            "STELL" : item.STELL,
            "STLTX" : item.STLTX,
			"photoStatus":item.photoStatus,
			"photoURL":item.photoURL,
			"photoURL2":item.photoURL2,
			"photoUpdateTime":item.photoUpdateTime
        });
    }

    var obj = {};
    var rs = [];
    for (var k in arr) {
        var item = arr[k];
        var userId = item.userId;
        if (obj[userId] == null) {
            rs.push(item);
            obj[userId] = Math.random();
        }
    }
    return rs.sort(sortUser);
}

//名称，部门
function sortUser(obj1, obj2) {
    var cmpNACHN1 = strcmp.jaro(obj1.userName==null?"":obj1.userName, keyWord);
    var cmpVORNA1 = strcmp.jaro(obj1.VORNA==null?"":obj1.VORNA, keyWord);
    //var cpmORGTX1 = strcmp.jaro(obj1.ORGTX==null?"":obj1.ORGTX, keyWord);
    //var cmp1 = cmpNACHN1 + cmpVORNA1 + cpmORGTX1;
     var cmp1 = cmpNACHN1 + cmpVORNA1;
    var cmpNACHN2 = strcmp.jaro(obj2.userName==null?"":obj2.userName, keyWord);
    var cmpVORNA2 = strcmp.jaro(obj2.VORNA==null?"":obj2.VORNA, keyWord);
    //var cpmORGTX2 = strcmp.jaro(obj2.ORGTX==null?"":obj2.ORGTX, keyWord);
   //var cmp2 = cmpNACHN2 + cmpVORNA2 + cpmORGTX2;
   var cmp2 = cmpNACHN2 + cmpVORNA2;
    var rs = cmp1 - cmp2;
    if (rs == 0) {
        rs = parseInt(obj1.STELL, 10) - parseInt(obj2.STELL, 10);
    }
    return rs;
}

function getUserIds(rs) {
    var arr = [];
    for (var i in rs) {
        arr.push(rs[i].userId);
    }
    return arr;
}

function addAppFuncUselog(userId) {
    var req = {
        "userId" : userId,
        "module" : "contact",
        "subModule" : "search"
    };
    var option = {
        agent : false,
        url : global.baseURL + "/app/addAppFuncUseLog",
        method : "POST",
        Body : req
    };
    MEAP.AJAX.Runner(option, function(err, res, data) {

    });
}

exports.Runner = run;

