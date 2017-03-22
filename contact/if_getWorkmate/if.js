var MEAP=require("meap");
var mongoose = require("mongoose");
var async = require("async");
var redis = require("meap_redis");
var contactSchema = require("../Contact.js");
var contactUtil = require("../util.js");
var util = require("../../base/util.js");

/**
 * 查询同事，为了提高照片的查询速度：
 * 1.先从redis查询；
 * 2如果redis不存在则从mongoose查询；
 * 3将结果缓存到redis	
 * @author donghua.wang
 * @date 2015年9月1日 19:11
 * */
function run(Param, Robot, Request, Response, IF)
{
     Response.setHeader("Content-Type","text/json;charset=utf8");
	 var arg = JSON.parse(Param.body.toString());
	 var rs = null;//redis缓存结果
	 var hashStr = null;
	 var userId = arg.userId;
	 var queryWorkmate = true;//默认从数据库查询同事信息
	 var queryPhoto = true;//默认调用接口查询照片信息
	 var users = null;//同事信息
	 var userWithPhotos = null;
	 var ORGEH = null;
	 //存储员工id，用于查询照片
	 var userIds = [];
	 var errMsg = "";
	 async.series([
		//查询人员信息
		function(cb){
			var conn = mongoose.createConnection(global.mongodbURL);
			var baseUserModel = conn.model("base_user",contactSchema.BaseUserSchema);
			var regExp = new RegExp(userId);
			baseUserModel.findOne({"PERNR":regExp},function(err,data){
				conn.close();
				if(data == null){
					Response.end(JSON.stringify({
						"status":"-1",
						"msg":"没有查询到当前用户信息"
					}));
				}else{
					ORGEH = data.ORGEH;
					hashStr = "getWorkmate~" + util.hashEncode(ORGEH);//缓存编码
					console.log(hashStr);
					cb(err,"");
				}
			});
		},
		//从redis查询部门同事
		function(cb){
			var redisCli = redis.createClient(global.redisPort,global.redisHost);
			redisCli.on("ready",function(){
				redisCli.select(contactUtil.contactConst.redisDB,function(){
					redisCli.get(hashStr,function(err,data){
						redisCli.quit();
						if(data != null){
							console.log("get data from redis");
							var jsonObj = JSON.parse(data);
							users = jsonObj.users;
							console.log(users);
							userIds  = getUserIds(users);
							queryWorkmate = false;
						}
						cb(err,"");
					});
				});
			});
		},
		//查询同事
		function(cb){
			if(queryWorkmate){
				var conn = mongoose.createConnection(global.mongodbURL);
				var baseUserModel = conn.model("base_user",contactSchema.BaseUserSchema);
				baseUserModel.find({"ORGEH":ORGEH,"STAT1":{"$in":["A","B","C","D"]}})
					.sort({"STELL":1,"VORNA":1})
					.exec(function(err,data){
						conn.close();
						console.log(data);
						if(err){
							errMsg = "查询同事失败";
						}
						userIds  = getUserIds(data);
						users = data;
						cb(err,"");
					});
			}else{
				cb(null,"");
			}
			
		},
		//查询备注信息
		function(cb){
			var conn = mongoose.createConnection(global.mongodbURL);
			var remarkModel = conn.model("contact_user_remark",contactSchema.ContactUserRemarkSchema);
			remarkModel.find({"userId":userId,"linkmanId":{"$in":userIds}},
							{
								"linkmanId":1,"remark":1
							},function(err,data){
								conn.close();
								cb(err,data);
							});
		}
	 ],function(err,data){
		 if(err){
			 Response.end(JSON.stringify({
				 "status":"-1",
				 "msg":errMsg
			 }));
		 }else{
			 var rs = getUserPhoto(users,userId);
			 Response.end(JSON.stringify({
				 "status":"0",
				 "data":rs,
				 "remark":data[3]
			 }));
			 //将结果缓存到redis
			 var redisCli = redis.createClient(global.redisPort,global.redisHost);
			 var content = JSON.stringify({
				 "users":users
			 });
			 redisCli.on("ready",function(){
				 redisCli.select(contactUtil.contactConst.redisDB,function(){
					 redisCli.setex(hashStr,43200,content,function(err){
						 console.log("save data to redis");
						 redisCli.quit();
					 });
				 });
			 });
		 }
	 });
}

function getUserIds(data){
	var rs = [];
	for(var i in data){
		var userId = data[i].PERNR;
		rs.push(userId);
	}
	return rs;
}

//得到员工照片，去除userId
function getUserPhoto(users,userId){
	var rs = [];
	var index = -1;
	for(var i in users){
		var user = users[i];
		var PERNR = user.PERNR;
		if(PERNR == userId || PERNR == '0' + userId){
			index = i;
		}
		var obj = {"userId":PERNR,"userName":user.NACHN,"ORGEH":user.ORGEH,"ORGTX":user.ORGTX,
					"STELL":user.STELL,"STLTX":user.STLTX,"PLANS":user.PLANS,"photoStatus":user.photoStatus,
					"photoURL":user.photoURL,"photoURL2":user.photoURL2,"photoUpdateTime":user.photoUpdateTime};
		
		rs.push(obj);
	}
	rs.splice(index,1);
	return rs;
}

exports.Runner = run;


                                

	

