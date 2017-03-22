var MEAP=require("meap");
var mongoose = require("mongoose");
var async = require("async");
var baseSchema = require("../../base/BaseSchema.js");
var qxSchema = require("../qxSchema.js");
var baseConfigDao = require("../_dao/baseConfigDao.js");
/**
 * 这是一个用于环信操作的service文件 
 */
var easemobService =  {
    
    getToken : function(cb){
        console.log("getToken start:");
        async.waterfall([
            //先查询mongodb,判断是否过期
            function(cb){
                baseConfigDao.getConfigByName("easemobToken",cb)    
            },
            function(data,cb){
                var nowTimeStamp = Date.now();
                if(!data || nowTimeStamp>data["expireAfterTimeStamp"]){
                    easemobService.saveToken(cb);
                }else{
                    console.log("get token directly."+JSON.stringify(data));
                    cb(null, data["value"]);
                }
            }
        ],function(err,data){
            if(!err){
                cb(null,data);
            }else{
                cb(err,data);
            }
        });
        
    },
    
    saveToken : function(cb){
        console.log("save token start:");
        var option = {
            method : "POST",
            url : "https://a1.easemob.com/"+global.easemob.orgName+"/"+global.easemob.appName+"/token",
            Cookie : "true",
            Body:{
                "grant_type":"client_credentials",
                "client_id":global.easemob.clientId,
                "client_secret":global.easemob.clientSecret
            },
            //Enctype:"application/json",
            Headers:{
                "Content-Type":"application/json"
            }
        };
        MEAP.AJAX.Runner(option,function(err,res,data){
            if(!err){
                data = JSON.parse(data);
                //调用成功
                if(data.error){
                    cb(-1,null);
                }else{
                    var paramMap = {
                        "name":"easemobToken",
                        "value":data["access_token"],
                        "expireAfterTimeStamp": Date.now()+data["expires_in"]
                    };
                    baseConfigDao.saveConfigByName(paramMap, null);
                    cb(null, data["access_token"]);
                }
            }else{
                //调用失败
                cb(-1,null);
            }
        })
    },
    
    getChatGroup : function(groupId, cb){
        async.waterfall([
            
            easemobService.getToken,
            
            function(token, cb){
                var option = {
                    method : "GET",
                    url : "https://a1.easemob.com/" + global.easemob.orgName + "/" + global.easemob.appName + "/chatgroups/" + groupId,
                    Headers:{
                        "Authorization":"Bearer " + token,
                        "Content-Type":"application/json"
                    },
                    timeout : 60,
                    agent : "false",
                    FileRNLength : "false"

                }; 
                MEAP.AJAX.Runner(option,function(err,res,data){ 
                    if(!err){
                        var data = JSON.parse(data);
                        if(data.data  && data.data[0] && data.data[0].affiliations){
                            var affiliations = data.data[0].affiliations;
                            var members = new Array(); 
                            for(var i in affiliations){
                                if(affiliations[i].owner){
                                    members.push(affiliations[i].owner);
                                }else{
                                    members.push(affiliations[i].member);
                                }
                            }
                            cb(null, members);
                        }else{
                            cb(null,new Array());
                        }
                    }else{
                        cb(err,null);
                    }
                });
            }
        ],function(err,data){
            cb(err,data); 
        });
    },

    createUsers:function(users,cb){
        async.waterfall([
        
            easemobService.getToken,

            function(token,cb){
                var tasks = new Array();
                for(var i=0; i<users.length; ++i){
                    tasks.push({
                        "username": parseInt(users[i].PERNR).toString(),
                        "password":parseInt(users[i].PERNR).toString(),
                        "nickname":users[i].NACHN
                    });
                }
                var queue = async.queue(function(task,cb){
                    var option = {
                        method : "POST",
                        url : "https://a1.easemob.com/"+global.easemob.orgName+"/"+global.easemob.appName+"/users/",
                        Cookie : "true",
                        Body:task,
                        Headers:{
                            "Content-Type":"application/json",
                            "Authorization":"Bearer "+ token
                        }
                    };
                    MEAP.AJAX.Runner(option,function(err,res,data){
                        console.log("******单个请求开始******");
                        console.log("option:"+JSON.stringify(option));
                        console.log("result:"+data);
                        console.log("******单个请求结束.*******");
                        if(!err){
                            var data = JSON.parse(data);
                            if(data.error && data.error!="duplicate_unique_property_exists"){
                                cb(-1,data.error);
                            }else{
                                //创建环信单个用户成功,保存到qx_register表中
                                var conn = mongoose.createConnection(global.mongodbURL);
                                var registerModel = conn.model("qx_register", qxSchema.qxRegisterSchema);
                                    registerModel.update({
                                        "userId":task.username
                                    },{
                                        "userId" : task.username,
                                        "nickName" : task.nickname,
                                        "createTime" : new Date().getTime()                                        
                                    },{
                                        "upsert" : true
                                    },function(err){
                                        conn.close();
                                        cb(0,"create easemob success.");
                                    });
                            }

                        }else{
                            cb(-1,"can not access easemob.");
                        }
                    });  
                },10);
                queue.push(tasks);
                queue.drain = function(){
                        cb(0,"easemobService:createUsers end.");
                };
            }
        ],function(err,msg){
            if(!err){
                cb(0,msg);
            }else{
                cb(err,null);
            }
        });
            
    }
};

exports.saveToken = easemobService.saveToken;
exports.getToken = easemobService.getToken;
exports.getChatGroup = easemobService.getChatGroup;
exports.createUsers = easemobService.createUsers;
