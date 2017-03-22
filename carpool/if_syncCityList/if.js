var MEAP=require("meap");
var redis = require("meap_redis");
var mongoose = require("mongoose");
var async = require("async");
var sm = require("../carpoolSchema.js");
var util = require("../util.js");
var path = require("path");
 //日期的模块
var moment = require('moment');

/**
 * 
 * ECC同步城市列表
 * 获取城市列表接口：
 * http://cttqdev.cttq.com:8000/sap/bc/srt/wsdl/flv_10002A111AD1/bndg_url/sap/bc/srt/rfc/sap/zcarpws006/800/zcarpws006/zcarpws006?sap-client=800
 * 同步方案：1.首先从ECC中获取数据，保存在mongodb和redis中，
 *          2、存在redis中，这样查询效率快
 *          3、用户第一次取得数据时，从mongodb中查询，查询完之后保存在redis中，当天其他用户就直接从redis中取了
 *          4、第二天的时候，第一次用户取数据的时候从mongodb中取，取完继续放redis中
 * 作者:xialin
 * 时间：2016-03-21
 */

function run(Param, Robot, Request, Response, IF)
{
     
   /*
    console.log(111111111);
       var day = moment(new Date());
       console.log(day.format('YYYYMMDD'));
       console.log(new Date().getTime());
       console.log(moment().toDate());
                  console.log(moment("20121212","YYYYMMDD").toDate());*/
   
	 
	
	console.log("sync syncCityList---->");
    //简单的请求验证
    
    var headers = Request.headers;
    var host = headers.host;
     
    
    /*if(host.indexOf("localhost") == -1){
        console.log("auth failed");
        Response.end(JSON.stringify({
            "status":"-1",
            "msg":"请求IP错误"
        }));
        return;
    }*/
	
	//获取当前时间
	var  currentDate =moment(new Date()).format("YYYYMMDD");
	
	var citys =[];
	
	  async.series([
    //判断是否需要更新
    function(cb) {
        var redisCli = redis.createClient(global.redisPort, global.redisHost);
        redisCli.on("ready", function() {
            redisCli.select(util.redisConst.redisDB, function() {
                redisCli.get("syncCityList", function(err, data) {
                    redisCli.quit();
                    if (data == null) {
                        //redis没有记录，说明第一次同步
                        cb(null, "");
                    } else {
                        
                        //进行转换
                       var data= moment(data,"YYYYMMDD HH:mm:ss").format("YYYYMMDD");
                        console.log(data+"     "+currentDate);
                        if (data != currentDate) {//说明同步是旧的时间
                            cb(null, "");
                        } else {
                            Response.end("数据已经同步");
                            console.log("数据已经同步");
                        }
                    }
                });
            });
        });
    },
    //调用webservice接口同步用户信息
   
        function(cb) {
           var paramJSon = {
            "IS_PUBLIC":{
                         "FLOWNO":"",
                         "PERNR":"",
                        "ZDOMAIN":"400",
                        "I_PAGENO":"",
                        "I_PAGESIZE":""
                        }
                     };
            
             var option={
        wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"zcarpws006.xml"),
        func:"ZCARPWS006.ZCARPWS006_soap12.ZCARPWS006",
        Params:paramJSon,
        agent:false
    };
            MEAP.SOAP.Runner(option, function(err, res, data1) {
                console.log("-------async  cityList zcarpws006");
                if (!err && data1.ES_PUBLIC.TYPE == 0 && data1.ET_AREA.item != null) {
                    var rs = data1.ET_AREA.item;
                    console.log("length------->",rs.length);
                    for(var i in rs){
                        citys.push(rs[i]);
                    }
                }
                cb(null,"");
            });
        },
	
	  //更新城市数据
    function(cb) {
        console.log("start upadte city info");
        if (citys.length > 0) {
           
            var conn = mongoose.createConnection(global.mongodbURL);
            var cityModel = conn.model("cityList", sm.CitySchema);
            
            var  updateTime =moment(new Date()).format("YYYYMMDD HH:mm:ss");
           
            var cityQueue = async.queue(function(task,callback){
                setTimeout(function(){
                    var city = task;
                  
                    var zid = city.ZID;
                    
        
                    cityModel.update({
                        "ZID" : zid
                    }, {
                      
                           "ZNANM"  :city.ZNANM,  //城市名称
                           "ZPINYIN":city.ZPINYIN,  //拼音
                           "ZSUOXIE":city.ZSUOXIE,  //拼音简写
                           "ZCSJB"  :city.ZCSJB,  //省内等级
                           "ZPRID"  :city.ZPRID,  //省代码
                           "ZPRNM"  :city.ZPRNM,  //省名称
                           "ZLEVL"  :city.ZLEVL,
                           "ZMDAT"  :city.ZMDAT,    //年月日
                           "ZMTIM"  :city.ZMTIM,    //时分秒
                           "ZVERSION":city.ZVERSION, //版本
                           "syncTime":updateTime  //更新时间
                      
                    
                    }, {
                        "upsert" : true
                    }, function(err) {
                     
                        cb(null,""); 
                        
                        
                    });
                },5000);
            },100);
            for(var i in citys){
                
                cityQueue.push(citys[i],function(err,data){
                    
                });
            }
            cityQueue.drain=function(){
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
            redisCli.select(util.redisConst.redisDB, function() {
                var  currentDate =moment(new Date()).format("YYYYMMDD HH:mm:ss");
                
                redisCli.set("syncCityList", currentDate, function(err) {
                    redisCli.quit();
                    cb(null, "");
                });
            });
        });
    }], function(err, data) {
        Response.end("cityList数据已经同步");
        console.log("cityList数据已经同步");
    });
}

exports.Runner = run;


                                

	

