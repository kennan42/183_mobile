var MEAP = require("meap");
var mongoose = require("mongoose");
var ContactSchema = require("../Contact.js");
var async = require("async");

/**
 * 搜索部门
 * @author donghua.wang
 * @date 2016年3月5日 09:48
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("contact.searchOrg start");
    Response.setHeader("Content-Type", "text/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
    var keyword = arg.keyword;
    var pageNumber = arg.pageNumber;
    var pageSize = 50;
    var skip = (pageNumber - 1) * pageSize;
    var conn = mongoose.createConnection(global.mongodbURL);
    var baseOrgModel = conn.model("base_org", ContactSchema.BaseOrgSchema);
    var reg = new RegExp(keyword, "i");
    var arr = [{
        "ZZ_SUB_OBJT" : reg
    }, {
        "ZZ_SUB_OBJP" : reg
    }];
    baseOrgModel.find({
        "$or" : arr,"ZZ_SUB_OBJ":{"$ne":"00000000"}
    }).sort({
        "ZZ_OBJT" : 1
    }).limit(pageSize).skip(skip).exec(function(err, orgs) {
        if (orgs.length == 0) {
            conn.close();
            Response.end(JSON.stringify({
                "status" : "0",
                "msg" : "查询成功",
                "data" : orgs
            }));
        } else {
            //查询部门级别
            var orgIds = [];
            for (var i in orgs) {
                orgIds.push(orgs[i].ZZ_SUB_OBJ);
            }
            baseOrgLevelModel = conn.model("base_org_level", ContactSchema.BaseOrgLevelSchema);
			var baseUserModel = conn.model("base_user", ContactSchema.BaseUserSchema);
            baseOrgLevelModel.find({
                "OBJID" : {
                    "$in" : orgIds
                }
            }, function(err, orgLevels) {
				var orgArray = [];
                for (var i in orgs) {
                    var org = orgs[i].toObject();
					delete org.ZZ_OTYPE;
					delete org.ZZ_OBJ;
					delete org.ZZ_OBJT;
					delete org.ZZ_OBJP;
					delete org.ZZ_SUB_OTYPE;
					delete org.ZZ_OBJ_LEVEL;
                    for (var j in orgLevels) {
                        var orgLevel = orgLevels[j];
                        if (org.ZZ_SUB_OBJ == orgLevel.OBJID) {
                            org.level = orgLevel.ZZ_JGCJ;
                            break;
                        }
                    }
					orgArray.push(org);
                }
				var rs = [];
                var queue = async.queue(function(task, cb) {
                    var level = task.level;
                    var condition = {};
					var orgId = task.ZZ_SUB_OBJ;
                    switch(level) {
                    case 1:
                        condition.ZZ_GS = orgId;
                        break;

                    case 2:
                        condition.ZZ_JG1 = orgId;
                        break;

                    case 3:
                        condition.ZZ_JG2 = orgId;
                        break;

                    case 4:
                        condition.ZZ_JG3 = orgId;
                        break;

                    case 5:
                        condition.ZZ_JG4 = orgId;
                        break;
                    }
                    condition.STAT1 = {
                        "$in" : ["A", "B", "C", "D"]
                    };
                    baseUserModel.count(condition, function(err, count) {
                        task.count = count;
						rs.push(task);
                        cb(null,null);
                    });

                },10);
                for (var i in orgArray) {
                    queue.push(orgArray[i]);
                }
                queue.drain = function() {
                    conn.close();
					console.log("contact.searchOrg end");
                    Response.end(JSON.stringify({
                        "status":"0",
                        "msg":"查询成功",
                        "data":rs
                    }));
                }
            });
        }
    });
}

exports.Runner = run;

