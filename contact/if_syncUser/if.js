var MEAP = require("meap");
var redis = require("meap_redis");
var mongoose = require("mongoose");
var ContactSchema = require("../Contact.js");
var util = require("../../base/util.js");
var path = require("path");
var async = require("async");
var contactUtil = require("../util.js");
var easemobService = require("../../qx/_service/easemobService.js");

/**
 * 同步员工信息（全量或者增量更新），prd环境分别在145，150上开启同步进程，
 * 如果145已经同步成功，则150不在进行同步
 *  (1)判断今天是否进行了同步
 *  (2)进行全量或者增量更新
 *  (3)设置更新标识
 * @author donghua.wang
 * @date 2015年8月27日 15:57
 * */
function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type", "text/json;charset=utf8");
    //简单的请求验证
   /* var headers = Request.headers;
    var host = headers.host;
    if (host.indexOf("localhost") == -1) {
        console.log("auth failed");
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "请求IP错误"
        }));
        return;
    }
*/
    var udpateAll = false;
    //是否全量更新
    var users = [];
    //调用webservice返回的员工信息
    var currentDate = util.getDateStrFromTimes(new Date().getTime(), false);
    async.series([
    //判断是否需要更新
   /*
   function(cb) {
        var redisCli = redis.createClient(global.redisPort, global.redisHost);
        redisCli.on("ready", function() {
            redisCli.select(contactUtil.contactConst.redisDB, function() {
                redisCli.get("syncUser", function(err, data) {
                    redisCli.quit();
                    if (data == null) {//全量更新
                        udpateAll = true;
                        cb(null, "");
                    } else {
                        if (data != currentDate) {//尚未进行增量更新
                            cb(null, "");
                        } else {
							Response.end("has synced on the first server");
                            console.log("has synced on the first server");
                        }
                    }
                });
            });
        });
    },
	*/
    //调用webservice接口同步用户信息
    function(cb) {
        async.parallel([
        function(cb1) {
            var reqParam = {
                "INCREMENTAL_UPDATING" : "",
                "IS_PUBLIC" : {
                    "FLOWNO" : "",
                    "PERNR" : "",
                    "ZDOMAIN" : "",
                    "I_PAGENO" : "",
                    "I_PAGESIZE" : ""
                },
                "KEYDATE" : "",
                "P_ORGEH" : {
                   
					   "item":
					   {"ORGEH":"00000002"},
                }
            };
            /*if (!udpateAll) {
				var times = new Date().getTime() - 86400000*1;
				var date1 = new Date();
				date1.setTime(times);
				var year = date1.getFullYear();
				var month = date1.getMonth() + 1;
				if(month < 10){
					month = "0" + month;
				}
				var date = date1.getDate();
				if(date < 10){
					date = "0" + date;
				}
				var dateStr = "" +　year + month + date;
				reqParam.KEYDATE = dateStr;
                reqParam.INCREMENTAL_UPDATING = "X";
            }*/
            var option = {
                "wsdl" : path.join(__dirname.replace(IF.name, ""), global.wsdl, "zhrws_increment_person.xml"),
                "func" : "ZHRWS_INCREMENT_PERSON.ZHRWS_INCREMENT_PERSON.ZHRWS_INCREMENT_PERSON",
                "Params" : reqParam,
                "agent":false
            };
            MEAP.SOAP.Runner(option, function(err, res, data1) {
				console.log("-------async  2");
				
				
                if (!err && data1.ES_PUBLIC.TYPE == 0 && data1.ET_ZHR_ALL_INFO.item != null) {
					
					var rs = data1.ET_ZHR_ALL_INFO.item;
					
					
					console.log("2-------->",rs.length);
					for(var i in rs){
						users.push(rs[i]);
					}
                }
                cb1(null,"");
            });
        },
		
		 function(cb1) {
            var reqParam = {
                "INCREMENTAL_UPDATING" : "",
                "IS_PUBLIC" : {
                    "FLOWNO" : "",
                    "PERNR" : "",
                    "ZDOMAIN" : "",
                    "I_PAGENO" : "",
                    "I_PAGESIZE" : ""
                },
                "KEYDATE" : "",
                "P_ORGEH" : {
                    "item" : {
                       "ORGEH":"00001276"
                    },
                }
            };
           /* if (!udpateAll) {
				var times = new Date().getTime() - 86400000*1;
				var date1 = new Date();
				date1.setTime(times);
				var year = date1.getFullYear();
				var month = date1.getMonth() + 1;
				if(month < 10){
					month = "0" + month;
				}
				var date = date1.getDate();
				if(date < 10){
					date = "0" + date;
				}
				var dateStr = "" +　year + month + date;
				reqParam.KEYDATE = dateStr;
                reqParam.INCREMENTAL_UPDATING = "X";
            }*/
            var option = {
                "wsdl" : path.join(__dirname.replace(IF.name, ""), global.wsdl, "zhrws_increment_person.xml"),
                "func" : "ZHRWS_INCREMENT_PERSON.ZHRWS_INCREMENT_PERSON.ZHRWS_INCREMENT_PERSON",
                "Params" : reqParam,
                "agent":false
            };
            MEAP.SOAP.Runner(option, function(err, res, data11) {
				console.log("-------async  22");
				
				
                if (!err && data11.ES_PUBLIC.TYPE == 0 && data11.ET_ZHR_ALL_INFO.item != null) {
					var rs = data11.ET_ZHR_ALL_INFO.item;
					console.log("22-------->",rs.length);
					for(var i in rs){
						users.push(rs[i]);
					}
                }
                cb1(null,"");
            });
        },
		
		
		
		
		
        function(cb1) {
            var reqParam = {
                "INCREMENTAL_UPDATING" : "",
                "IS_PUBLIC" : {
                    "FLOWNO" : "",
                    "PERNR" : "",
                    "ZDOMAIN" : "",
                    "I_PAGENO" : "",
                    "I_PAGESIZE" : ""
                },
                "KEYDATE" : "",
                "P_ORGEH" : {
                    "item" : {
                        "ORGEH" : "00000003"
                    },
                }
            };
            /* if (!udpateAll) {
				var times = new Date().getTime() - 86400000*1;
				var date1 = new Date();
				date1.setTime(times);
				var year = date1.getFullYear();
				var month = date1.getMonth() + 1;
				if(month < 10){
					month = "0" + month;
				}
				var date = date1.getDate();
				if(date < 10){
					date = "0" + date;
				}
				var dateStr = "" +　year + month + date;
				reqParam.KEYDATE = dateStr;
                reqParam.INCREMENTAL_UPDATING = "X";
            }*/
            var option = {
                "wsdl" : path.join(__dirname.replace(IF.name, ""), global.wsdl, "zhrws_increment_person.xml"),
                "func" : "ZHRWS_INCREMENT_PERSON.ZHRWS_INCREMENT_PERSON.ZHRWS_INCREMENT_PERSON",
                "Params" : reqParam,
                "agent":false
            };
            MEAP.SOAP.Runner(option, function(err, res, data2) {
				console.log("-------async  3");
                if (!err && data2.ES_PUBLIC.TYPE == 0 && data2.ET_ZHR_ALL_INFO.item != null) {
                   var rs = data2.ET_ZHR_ALL_INFO.item;
				   console.log("3-------->",rs.length);
					for(var i in rs){
						users.push(rs[i]);
					}
                }
                cb1(null,"");
            });
        },
        function(cb1) {
            var reqParam = {
                "INCREMENTAL_UPDATING" : "",
                "IS_PUBLIC" : {
                    "FLOWNO" : "",
                    "PERNR" : "",
                    "ZDOMAIN" : "",
                    "I_PAGENO" : "",
                    "I_PAGESIZE" : ""
                },
                "KEYDATE" : "",
                "P_ORGEH" : {
                    "item" : {
                        "ORGEH" : "00000004"
                    },
                }
            };
             /*if (!udpateAll) {
				var times = new Date().getTime() - 86400000*1;
				var date1 = new Date();
				date1.setTime(times);
				var year = date1.getFullYear();
				var month = date1.getMonth() + 1;
				if(month < 10){
					month = "0" + month;
				}
				var date = date1.getDate();
				if(date < 10){
					date = "0" + date;
				}
				var dateStr = "" +　year + month + date;
				reqParam.KEYDATE = dateStr;
                reqParam.INCREMENTAL_UPDATING = "X";
            }*/
            var option = {
                "wsdl" : path.join(__dirname.replace(IF.name, ""), global.wsdl, "zhrws_increment_person.xml"),
                "func" : "ZHRWS_INCREMENT_PERSON.ZHRWS_INCREMENT_PERSON.ZHRWS_INCREMENT_PERSON",
                "Params" : reqParam,
                "agent":false
            };
            MEAP.SOAP.Runner(option, function(err, res, data3) {
				console.log("-------async  4");
                if (!err && data3.ES_PUBLIC.TYPE == 0 && data3.ET_ZHR_ALL_INFO.item != null) {
                    var rs = data3.ET_ZHR_ALL_INFO.item;
					console.log("4-------->",rs.length);
					for(var i in rs){
						users.push(rs[i]);
					}
                }
                cb1(null,"");
            });
        }
		
		], function(err, data) {
			console.log("users length---------->",users.length);
            //先去除更新用户
			cb(null, "");
        });
    },
    //更新用户数据
    function(cb) {
        console.log("start upadte user info");
        if (users.length > 0) {
			var conn = mongoose.createConnection(global.mongodbURL);
			var userModel = conn.model("base_user", ContactSchema.BaseUserSchema);
			var userQueue = async.queue(function(task,callback){
				setTimeout(function(){
					var user = task;
					var telSuf = "";
					var userId = user.PERNR;
					//默认未设置 :3
					var vis =3;
					userModel.find({"PERNR" : userId},function(err,data){
					    if(!err){
					        if(data.length == 0){
					            //新入职员工
					            //新员工设置为""
					               if(user.BUKRS=='2000'&&user.BTRTL=='2010'){
					                   //2903 连云港2000  行销系统2010 下面的 非设置的人员 设置为0
					                   vis =0;
					               }
								   
					userModel.update({
						"PERNR" : userId
					}, {
						"PLANS" : user.PLANS,
						"NACHN" : user.NACHN,
						"VORNA" : user.VORNA,
						"INITS" : user.INITS,
						"GESCH" : user.GESCH,
						"GESCH_T" : user.GESCH_T,
						"GBDAT" : user.GBDAT,
						"BUKRS" : user.BUKRS,
						"BUTXT" : user.BUTXT,
						"ZZ_GS" : user.ZZ_GS,
						"ZZ_GST" : user.ZZ_GST,
						"ZZ_JG1" : user.ZZ_JG1,
						"ZZ_JG1T" : user.ZZ_JG1T,
						"ZZ_JG2" : user.ZZ_JG2,
						"ZZ_JG2T" : user.ZZ_JG2T,
						"ZZ_JG3" : user.ZZ_JG3,
						"ZZ_JG3T" : user.ZZ_JG3T,
						"ZZ_JG4" : user.ZZ_JG4,
						"ZZ_JG4T" : user.ZZ_JG4T,
						"ZZ_JG5" : user.ZZ_JG5,
						"ZZ_JG5T" : user.ZZ_JG5T,
						"ORGEH" : user.ORGEH,
						"ORGTX" : user.ORGTX,
						"PLSTX" : user.PLSTX,
						"PROZT" : user.PROZT,
						"STELL" : user.STELL,
						"STLTX" : user.STLTX,
						"ZZ_SPCJ" : user.ZZ_SPCJ,
						"ZZ_SPCJT" : user.ZZ_SPCJT,
						"STAT1" : user.STAT1,
						"STAT1T" : user.STAT1T,
						"ZZ_TEL" : user.ZZ_TEL,
						"ZZ_TEL_SUF" : telSuf,
						"ZZ_RTX" : user.ZZ_RTX,
						"ZZ_EMAIL" : user.ZZ_EMAIL,
						"LINE_MANAGER" : user.LINE_MANAGER,
						"LM_NACHN" : user.LM_NACHN,
						"ZZ_RQ" : user.ZZ_RQ,
						"ZZ_SJ" : user.ZZ_SJ,
						"WERKS":user.WERKS,
						"PBTXT":user.PBTXT,
						"BTRTL":user.BTRTL,
						"BTRTX":user.BTRTX,
						"PERSG":user.PERSG,
						"PGTXT":user.PGTXT,
						"PERSK":user.PERSK,
						"PKTXT":user.PKTXT,
						"ZZ_XSRY":user.ZZ_XSRY,
						"ZZ_RZSJ":user.ZZ_RZSJ,
						"ZZ_ZZSJ":user.ZZ_ZZSJ,
						"ZZ_TCSJ":user.ZZ_TCSJ,
						"ZZ_LZSJ":user.ZZ_LZSJ,
						"ZZ_YGSL":user.ZZ_YGSL,
						"ZZ_CZD":user.ZZ_CZD,
						"ZZ_CZDA":user.ZZ_CZDA,
						"ZZ_CZDA_T":user.ZZ_CZDA_T,
						"ZZ_CZDB":user.ZZ_CZDB,
						"ZZ_CZDB_T":user.ZZ_CZDB_T,
						"ZZ_CZDC":user.ZZ_CZDC,
						"ZZ_CZDC_T":user.ZZ_CZDC_T,
						"ZZ_LDBG":user.ZZ_LDBG,
						"ZZ_CZD1":user.ZZ_CZD1,
						"ZZ_CZDA1":user.ZZ_CZDA1,
						"ZZ_CZDA1_T":user.ZZ_CZDA1_T,
						"ZZ_CZDB1":user.ZZ_CZDB1,
						"ZZ_CZDB1_T":user.ZZ_CZDB1_T,
						"ZZ_CZDC1":user.ZZ_CZDC1,
						"ZZ_CZDC1_T":user.ZZ_CZDC1_T,
						"ZZ_JTTF":user.ZZ_JTTF,
						"ZZ_SFPC":user.ZZ_SFPC,
                        "ZZ_TEL_VIS":vis,
						"syncTime":new Date().getTime()
					}, {
						"upsert" : true
					}, function(err) {
						callback(null,"");	
                    });
					        }else{
					            // 已存在员工 
								
								if(parseInt(user.PROZT, 10)>=parseInt(data[0].PROZT, 10)){
									
					             userModel.update({
                        "PERNR" : userId
                    }, {
                        "PLANS" : user.PLANS,
                        "NACHN" : user.NACHN,
                        "VORNA" : user.VORNA,
                        "INITS" : user.INITS,
                        "GESCH" : user.GESCH,
                        "GESCH_T" : user.GESCH_T,
                        "GBDAT" : user.GBDAT,
                        "BUKRS" : user.BUKRS,
                        "BUTXT" : user.BUTXT,
                        "ZZ_GS" : user.ZZ_GS,
                        "ZZ_GST" : user.ZZ_GST,
                        "ZZ_JG1" : user.ZZ_JG1,
                        "ZZ_JG1T" : user.ZZ_JG1T,
                        "ZZ_JG2" : user.ZZ_JG2,
                        "ZZ_JG2T" : user.ZZ_JG2T,
                        "ZZ_JG3" : user.ZZ_JG3,
                        "ZZ_JG3T" : user.ZZ_JG3T,
                        "ZZ_JG4" : user.ZZ_JG4,
                        "ZZ_JG4T" : user.ZZ_JG4T,
                        "ZZ_JG5" : user.ZZ_JG5,
                        "ZZ_JG5T" : user.ZZ_JG5T,
                        "ORGEH" : user.ORGEH,
                        "ORGTX" : user.ORGTX,
                        "PLSTX" : user.PLSTX,
                        "PROZT" : user.PROZT,
                        "STELL" : user.STELL,
                        "STLTX" : user.STLTX,
                        "ZZ_SPCJ" : user.ZZ_SPCJ,
                        "ZZ_SPCJT" : user.ZZ_SPCJT,
                        "STAT1" : user.STAT1,
                        "STAT1T" : user.STAT1T,
                        "ZZ_TEL" : user.ZZ_TEL,
                        "ZZ_TEL_SUF" : telSuf,
                        "ZZ_RTX" : user.ZZ_RTX,
                        "ZZ_EMAIL" : user.ZZ_EMAIL,
                        "LINE_MANAGER" : user.LINE_MANAGER,
                        "LM_NACHN" : user.LM_NACHN,
                        "ZZ_RQ" : user.ZZ_RQ,
                        "ZZ_SJ" : user.ZZ_SJ,
                        "WERKS":user.WERKS,
                        "PBTXT":user.PBTXT,
                        "BTRTL":user.BTRTL,
                        "BTRTX":user.BTRTX,
                        "PERSG":user.PERSG,
                        "PGTXT":user.PGTXT,
                        "PERSK":user.PERSK,
                        "PKTXT":user.PKTXT,
                        "ZZ_XSRY":user.ZZ_XSRY,
                        "ZZ_RZSJ":user.ZZ_RZSJ,
                        "ZZ_ZZSJ":user.ZZ_ZZSJ,
                        "ZZ_TCSJ":user.ZZ_TCSJ,
                        "ZZ_LZSJ":user.ZZ_LZSJ,
                        "ZZ_YGSL":user.ZZ_YGSL,
                        "ZZ_CZD":user.ZZ_CZD,
                        "ZZ_CZDA":user.ZZ_CZDA,
                        "ZZ_CZDA_T":user.ZZ_CZDA_T,
                        "ZZ_CZDB":user.ZZ_CZDB,
                        "ZZ_CZDB_T":user.ZZ_CZDB_T,
                        "ZZ_CZDC":user.ZZ_CZDC,
                        "ZZ_CZDC_T":user.ZZ_CZDC_T,
                        "ZZ_LDBG":user.ZZ_LDBG,
                        "ZZ_CZD1":user.ZZ_CZD1,
                        "ZZ_CZDA1":user.ZZ_CZDA1,
                        "ZZ_CZDA1_T":user.ZZ_CZDA1_T,
                        "ZZ_CZDB1":user.ZZ_CZDB1,
                        "ZZ_CZDB1_T":user.ZZ_CZDB1_T,
                        "ZZ_CZDC1":user.ZZ_CZDC1,
                        "ZZ_CZDC1_T":user.ZZ_CZDC1_T,
                        "ZZ_JTTF":user.ZZ_JTTF,
                        "ZZ_SFPC":user.ZZ_SFPC,
                        "syncTime":new Date().getTime()
                    }, {
                        "upsert" : true
                    }, function(err) {
                        callback(null,"");  
                    });   }
					        }
					    }else{
					        //
					        Response.end("sync user---find err");
					    }
					});
				},5000);
			},100);
			for(var i in users){
				userQueue.push(users[i],function(err,data){});
			}
			userQueue.drain=function(){
				conn.close();
				cb(null,"");
			}
        } else {
            cb(null, "");
        }

    },
    //设置用户同步标识
    function(cb) {
        var redisCli = redis.createClient(global.redisPort, global.redisHost);
        redisCli.on("ready", function() {
            redisCli.select(contactUtil.contactConst.redisDB, function() {
                redisCli.set("syncUser", currentDate, function(err) {
                    redisCli.quit();
                    cb(null, "");
                });
            });
        });
    }
	,

    //同步向环信中创建这些用户帐号
    function(cb) {
        easemobService.createUsers(users,function(err,data){
            cb(err,data);
        })
    }
    ], function(err, data) {
		Response.end("sync user over");
        console.log("sync user over");
    });
}

//更新员工信息
// function upsertUser(i, users, conn, userModel, cb) {
//     i = i || 0;
//     if (i < users.length) {
//         var user = users[i];
//         var telSuf = "";
// 		var userId = user.PERNR;
//         userModel.update({
//             "PERNR" : userId
//         }, {
//             "PLANS" : user.PLANS,
//             "NACHN" : user.NACHN,
//             "VORNA" : user.VORNA,
//             "INITS" : user.INITS,
//             "GESCH" : user.GESCH,
//             "GESCH_T" : user.GESCH_T,
//             "GBDAT" : user.GBDAT,
//             "BUKRS" : user.BUKRS,
//             "BUTXT" : user.BUTXT,
//             "ZZ_GS" : user.ZZ_GS,
//             "ZZ_GST" : user.ZZ_GST,
//             "ZZ_JG1" : user.ZZ_JG1,
//             "ZZ_JG1T" : user.ZZ_JG1T,
//             "ZZ_JG2" : user.ZZ_JG2,
//             "ZZ_JG2T" : user.ZZ_JG2T,
//             "ZZ_JG3" : user.ZZ_JG3,
//             "ZZ_JG3T" : user.ZZ_JG3T,
//             "ZZ_JG4" : user.ZZ_JG4,
//             "ZZ_JG4T" : user.ZZ_JG4T,
//             "ZZ_JG5" : user.ZZ_JG5,
//             "ZZ_JG5T" : user.ZZ_JG5T,
//             "ORGEH" : user.ORGEH,
//             "ORGTX" : user.ORGTX,
//             "PLSTX" : user.PLSTX,
//             "PROZT" : user.PROZT,
//             "STELL" : user.STELL,
//             "STLTX" : user.STLTX,
//             "ZZ_SPCJ" : user.ZZ_SPCJ,
//             "ZZ_SPCJT" : user.ZZ_SPCJT,
//             "STAT1" : user.STAT1,
//             "STAT1T" : user.STAT1T,
//             "ZZ_TEL" : user.ZZ_TEL,
//             "ZZ_TEL_SUF" : telSuf,
//             "ZZ_RTX" : user.ZZ_RTX,
//             "ZZ_EMAIL" : user.ZZ_EMAIL,
//             "LINE_MANAGER" : user.LINE_MANAGER,
//             "LM_NACHN" : user.LM_NACHN,
//             "ZZ_RQ" : user.ZZ_RQ,
//             "ZZ_SJ" : user.ZZ_SJ,
// 			"WERKS":user.WERKS,
// 			"PBTXT":user.PBTXT,
// 			"BTRTL":user.BTRTL,
// 			"BTRTX":user.BTRTX,
// 			"PERSG":user.PERSG,
// 			"PGTXT":user.PGTXT,
// 			"PERSK":user.PERSK,
// 			"PKTXT":user.PKTXT,
// 			"ZZ_XSRY":user.ZZ_XSRY,
// 			"ZZ_RZSJ":user.ZZ_RZSJ,
// 			"ZZ_ZZSJ":user.ZZ_ZZSJ,
// 			"ZZ_TCSJ":user.ZZ_TCSJ,
// 			"ZZ_LZSJ":user.ZZ_LZSJ,
// 			"ZZ_YGSL":user.ZZ_YGSL,
// 			"ZZ_CZD":user.ZZ_CZD,
// 			"ZZ_CZDA":user.ZZ_CZDA,
// 			"ZZ_CZDA_T":user.ZZ_CZDA_T,
// 			"ZZ_CZDB":user.ZZ_CZDB,
// 			"ZZ_CZDB_T":user.ZZ_CZDB_T,
// 			"ZZ_CZDC":user.ZZ_CZDC,
// 			"ZZ_CZDC_T":user.ZZ_CZDC_T,
// 			"ZZ_LDBG":user.ZZ_LDBG,
// 			"ZZ_CZD1":user.ZZ_CZD1,
// 			"ZZ_CZDA1":user.ZZ_CZDA1,
// 			"ZZ_CZDA1_T":user.ZZ_CZDA1_T,
// 			"ZZ_CZDB1":user.ZZ_CZDB1,
// 			"ZZ_CZDB1_T":user.ZZ_CZDB1_T,
// 			"ZZ_CZDC1":user.ZZ_CZDC1,
// 			"ZZ_CZDC1_T":user.ZZ_CZDC1_T,
// 			"ZZ_JTTF":user.ZZ_JTTF,
// 			"ZZ_SFPC":user.ZZ_SFPC,
// 			"syncTime":new Date().getTime()
//         }, {
//             "upsert" : true
//         }, function(err) {
// 			i++;
//             upsertUser(i, users, conn, userModel, cb);
//         });
//     } else {
//         conn.close();
// 		console.log("i--------------->",i);
//         cb(null, "");
//     }
// }

exports.Runner = run;

