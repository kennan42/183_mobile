var MEAP=require("meap");
var path = require("path");
var redis = require("meap_redis");
var mongoose = require("mongoose");
var async = require("async");

var sm = require("../carpoolSchema.js"); 
var util = require("../util.js");
 //日期的模块
var moment = require('moment');
 
/**
 * 获取城市列表
 * 1.先从redis中取得看是否有数据，如果有数据从redis中取，如果没有从mongodb中取得后放入redis
 * 作者：xialin
 * 时间：20160323
 */
function run(Param,Robot,Request,Response,IF)
{
   
  
  //获取当前时间
    var  currentDate =moment(new Date()).format("YYYYMMDD");
  
      async.series([
    //判断redis是否有数据 
    function(cb) {
        var redisCli = redis.createClient(global.redisPort, global.redisHost);
        redisCli.on("ready", function() {
            redisCli.select(util.redisConst.redisDB, function() {
                redisCli.get("cityList", function(err, data) {
                    redisCli.quit();
                    if (data == null) {
                        //redis没有记录，说明没有记录，从mongodb中取
                        cb(null, "");
                    } else {
                        
                      
                            //将redis返回的记录给返回出去
                            
                            Response.end(JSON.stringify({
                                
                                "status":"0",
                                "data":data
                            }));
                       
                    }
                });
            });
        });
    },
    function(cb) {
        //
        console.log("从mongodb中获取数据");
        
        var conn = mongoose.createConnection(global.mongodbURL);
        var cityModel = conn.model("cityList", sm.CitySchema);
        
        cityModel.find({},{ZID:-1,ZNANM:-1,ZPINYIN:-1,ZSUOXIE:-1,ZCSJB:-1,ZPRID:-1,ZPRNM:-1,ZLEVL:-1}).exec(function(err, data) {
        conn.close();
        
        if(!err){ 
            cb(null,data);
            
        }else{
             Response.end(JSON.stringify({
                                
                                "status":"-1",
                                "msg":"查询mongodb失败"
                            }));
        }
        
        
    });
        
        
        
        
    }
    ], function(err, data) {
         
         console.log(data[1]);
        
        var redisCli = redis.createClient(global.redisPort, global.redisHost);
        redisCli.on("ready", function() {
            redisCli.select(util.redisConst.redisDB, function() {
              
                
                redisCli.set("cityList", data[1], function(err) {
                    redisCli.quit();
                    
                });
            });
        });
        
      
        Response.end(JSON.stringify({
                                
                                "status":"0",
                                "data":data[1]
                            }));
        
    });
   
}

exports.Runner = run;
