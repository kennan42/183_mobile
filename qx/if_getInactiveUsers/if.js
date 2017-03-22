var MEAP=require("meap");
var mongoose = require("mongoose");
var async = require("async");
var baseSchema = require("../../base/BaseSchema.js");
var analySchema = require("../../analy/AnalySchema.js");


function run(Param, Robot, Request, Response, IF)
{
    // console.log("getInactiveUsers start:");
    Response.setHeader("Content-Type", "application/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    //console.log("arg:"+arg);
    var userIds = arg.userIds;
        //查询配置的活跃用户判断标准(时间标准)
    var conn = mongoose.createConnection(global.mongodbURL);

    async.parallel([
        function (cb){
            queryDaysToDetermineActiveUser(cb);
        },
        function(cb){
            queryLoginTimeByUserIds(cb);
        }],function(err, data){
            conn.close();
            var result = [];
            if(err){
                cb(err,data);
                Response.end(JSON.stringify({
                    status : -1
                }));                     
            }else{
                var time = data[0].value;
                var subUserIds = data[1];
                for(var i in subUserIds){
                    if( ((new Date()).getTime() - subUserIds[i].lastLoginTime)/(86400*1000) > time ){
                        result.push(subUserIds[i]._id);
                    }
                }
                for(var i in userIds){
                    var ifHas = false;
                    for(var j in subUserIds){
                        if(userIds[i] == subUserIds[j]._id)
                        ifHas = true;
                    }
                    if(!ifHas)
                        result.push(userIds[i]);
                }
            }
            console.log("qx.getInactiveUsers end");
            Response.end(JSON.stringify({
                status : 0,
                inactiveUsers : result,
            }));            
        });
        
        function queryDaysToDetermineActiveUser(cb){
            //查询配置的活跃用户判断标准(时间标准)
            var baseConfigModel = conn.model("base_config", baseSchema.baseConfigSchema);
            baseConfigModel.findOne({name:"daysToDetermineActiveUser"}, function(err, data){
                if(err !== null || data === null){
                     cb(err, data);
                }else{
                    cb(null,data);
                }
            });
        }
        
        function queryLoginTimeByUserIds(cb){
            //根据员工工号查询登录时间
            var analyLoginModel = conn.model("analy_last_login",analySchema.AnalyLastLoginSchema);
            analyLoginModel.aggregate([
                {$match:{userId:{$in:userIds}}}
                ]).exec(function(err,data){
                if(err != null || data ==null){
                     cb(err, data);
                }else{
                    cb(null,data);
                }
            });
        }
}


exports.Runner = run;
