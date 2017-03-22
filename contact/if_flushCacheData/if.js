var MEAP = require("meap");
var redis = require("meap_redis");
var async = require("async");
var mongoose = require("mongoose");
var contactUtil = require("../util.js");
var contactSchema = require("../Contact.js");
var util = require("../../base/util.js");

/**
 *刷新缓存
 *@author donghua.wang
 *@date 2015年9月11日 11:43
 */
 var flush_org_data_arr = null;
function run(Param, Robot, Request, Response, IF) {
    //简单的请求验证
    var headers = Request.headers;
    var host = headers.host;
    if (host.indexOf("localhost") == -1) {
        console.log("auth failed");
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "请求IP错误"
        }));
        return;
    }
    var currentDate = util.getDateStrFromTimes(new Date().getTime(), false);
    var keys = [];
    async.series([
    //判断组织部门是否同步成功
    function(cb) {
        var redisCli = redis.createClient(global.redisPort, global.redisHost);
        redisCli.on("ready", function() {
            redisCli.select(contactUtil.contactConst.redisDB, function() {
                redisCli.get("syncOrg", function(err, data) {
                    redisCli.quit();
                    if (data != null || data == currentDate) {
                        cb(null, "");
                    } else {
                        console.log("sync org error");
                        Response.end("sync org error");
                    }
                });
            });
        });
    },
    //判断部门层级是否同步成功
    function(cb) {
        var redisCli = redis.createClient(global.redisPort, global.redisHost);
        redisCli.on("ready", function() {
            redisCli.select(contactUtil.contactConst.redisDB, function() {
                redisCli.get("syncOrgLevel", function(err, data) {
                    redisCli.quit();
                    if (data != null || data == currentDate) {
                        cb(null, "");
                    } else {
                        console.log("sync orgLevel error");
                        Response.end("sync orgLevel error");
                    }
                });
            });
        });
    },
	//扫描所有的缓存组织机构数据
    function(cb) {
        var redisCli = redis.createClient(global.redisPort, global.redisHost);
        redisCli.on("ready", function() {
            redisCli.select(contactUtil.contactConst.redisDB, function() {
                scan(0, redisCli, keys, cb);
            });
        });
    }
    ], function(err,data) {
		//更新redis里的缓存组织机构信息信息
        var redisCli = redis.createClient(global.redisPort, global.redisHost);
        redisCli.on("ready", function() {
            redisCli.select(contactUtil.contactConst.redisDB, function() {
				Response.end("start flush org cache");
				var conn = mongoose.createConnection(global.mongodbURL);
                updateOrgCacheInfo(0, flush_org_data_arr, redisCli,conn);
            });
        });
    });
}

function scan(i, redisCli, keys, cb) {
    i = i || 0;
    redisCli.scan(i, "match", "getChildOrg*", function(err, data) {
        var i = data[0];
		keys = keys.concat(data[1]);
        if (i != "0") {
            scan(i, redisCli, keys, cb);
        } else {
			flush_org_data_arr = keys;
            redisCli.quit();
            cb(err, "");
        }
    });
}

//更新redis里的缓存组织机构信息信息
function updateOrgCacheInfo(i, keys, redisCli,conn) {
    i = i || 0;
    if (i < keys.length) {
		var orgModel = conn.model("base_org",contactSchema.BaseOrgSchema);
		var orgLevelModel = conn.model("base_org_level",contactSchema.BaseOrgLevelSchema);
		var orgIds = [];
        var arr = keys[i].split("~");
        var orgId = "";
        if (arr.length == 2) {
            orgId = arr[1];
        }
		console.log("orgId--->",orgId);
		var topOrgIds = null;
        async.series([
        //查询顶级部门id
        function(cb) {
            if (orgId == "") {
                var userModel = conn.model("base_user", contactSchema.BaseUserSchema);
                userModel.distinct("ZZ_GS", function(err, data) {
                    if (err) {
                        console.log("查询顶级部门id失败");
                    }
                    topOrgIds = data;
                    cb(err, "");
                });
            } else {
                cb(null, "");
            }
        },
        //查询部门
        function(cb) {
            console.log("get org data");
            var condition = {};
			var sort = {"ZZ_SUB_OBJ":1};
            if (orgId == "") {//默认查询3个顶级部门
                condition = {
                    "ZZ_OBJ" : "00000001",
                    "ZZ_OBJ_LEVEL" : "2",
                    "ZZ_SUB_OBJ" : {
                        "$in" : topOrgIds
                    }
                }
            } else {
                condition = {
                    "ZZ_OBJ" : orgId
                };
            }
            orgModel.find(condition).sort(sort).exec(function(err, data) {
                if (err) {
                    console.log(err, "查询部门信息失败");
                }
                orgIds = getOrgIds(data);
                cb(err, data);
            });
        },
        //查询部门级别
        function(cb) {
            console.log("get orgLevel data");
            orgLevelModel.find({
                "OBJID" : {
                    "$in" : orgIds
                }
            }, function(err, data) {
                if (err) {
                    console.log(err, "查询部门级别失败");
                }
                cb(err, data);
            });
        }], function(err, data) {
            if (err) {
				updateOrgCacheInfo(i, keys, redisCli,conn);
				i++;
            } else {
                var orgs = data[1];
                var orgLevels = data[2];
                var orgWithLevels = getOrgWithLevel(orgs, orgLevels);
                //将结果缓存到redis
                result = JSON.stringify(orgWithLevels);
				console.log("getChildOrg~" + orgId);
                redisCli.setex("getChildOrg~" + orgId, contactUtil.contactConst.ttl, result, function(err) {  
							i++;
                            updateOrgCacheInfo(i, keys, redisCli,conn);
                        });
            }
        });
    } else {
		conn.close();
		redisCli.quit();
        console.log("flush org cache over");
    }
}

function getOrgIds(orgs){
	var rs = [];
	for(var i in orgs){
			rs.push(orgs[i].ZZ_SUB_OBJ);
	}
	return rs;
}

function getOrgWithLevel(orgs,orgLevels){
	var rs = [];
	for(var i in orgs){
		var org = orgs[i];
		var jgcj = "";//层级
		var orgId = org.ZZ_SUB_OBJ;
		for(var j in orgLevels){
			if(orgId ==  orgLevels[j].OBJID){
				jgcj = orgLevels[j].ZZ_JGCJ;
				rs.push({"orgId":org.ZZ_SUB_OBJ,"orgName":org.ZZ_SUB_OBJT,"orgLevel":jgcj,
					"orgFZR":org.ZZ_BMFZR,"orgFRZName":org.ZZ_BMFZR_XM});
				break;
			}
		}
	}
	return rs;
}

exports.Runner = run;

