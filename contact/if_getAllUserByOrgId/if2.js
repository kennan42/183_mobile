var MEAP = require("meap");
var mongoose = require("mongoose");
var async = require("async");
var contactSchema = require("../Contact.js");

function run(Param, Robot, Request, Response, IF)
{
	Response.setHeader("Content-Type","text/json;charset=utf8");
	var arg = JSON.parse(Param.body.toString());
	var orgId = arg.orgId;
	var userId = arg.userId;
	var conn = mongoose.createConnection(global.mongodbURL);
	var orgLevelModel = conn.model("base_org_level",contactSchema.BaseOrgLevelSchema);
	var userModel = conn.model("base_user",contactSchema.BaseUserSchema);
	var orgLevel = null;
	async.series([
		//查询部门级别
		function(cb){
			orgLevelModel.findOne({"OBJID":orgId},function(err,data){
				orgLevel = data.ZZ_JGCJ;
				cb(err,"");
			});
		},
		//查询部门及其子部门的所有人员
		function(cb){
			var condition = getCondition(orgLevel,orgId);
			console.log(condition);
			userModel.find(condition,{"PERNR":1,"NACHN":1,"photoURL":1})
					 .sort({"STELL":1,"VORNA":1})
					 .exec(function(err,data){
							cb(err,data);
			});
		}
	],function(err,data){
		conn.close();
		if(err){
			Response.end(JSON.stringify({
				"status":"-1",
				"msg":"查询失败"
			}));
		}else{
			Response.end(JSON.stringify({
				"status":"0",
				"data":data[1]
			}));
		}
	});
}

//根据部门级别就算查询条件，对base_user表进行查询
function getCondition(orgLevel,orgId){
	var condition = null;
	switch(orgLevel){
		case 1:
		condition = {"ZZ_GS":orgId};
		break;
		case 2:
		condition = {"ZZ_JG1":orgId};
		break;
		case 3:
		condition = {"ZZ_JG2":orgId};
		break;
		case 4:
		condition = {"ZZ_JG3":orgId};
		break;
		case 5:
		condition = {"ZZ_JG4":orgId};
		break;
		case 6:
		condition = {"ZZ_JG5":orgId};
		break;
	}
	condition.STAT1 = {"$in":["A","B","C","D"]};
	return condition;
}

exports.Runner = run;


                                

	

