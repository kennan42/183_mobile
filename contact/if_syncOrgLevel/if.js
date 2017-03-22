var MEAP=require("meap");
var mongoose = require("mongoose");
var path = require("path");
var async = require("async");
var redis = require("meap_redis");
var contactSchema = require("../Contact.js");
var util = require("../../base/util.js");
var contactUtil = require("../util.js");
/**
 * 同步组织机构层级
 * 生产环境分别在145,150上进行同步，如果145已经进行同步，则150不再进行同步
 * @author donghua.wang
 * @date 2015年9月1日 16:17
 * */
function run(Param, Robot, Request, Response, IF)
{
    //简单的请求验证
    var headers = Request.headers;
    var host = headers.host;
    if(host.indexOf("localhost") == -1){
        console.log("auth failed");
        Response.end(JSON.stringify({
            "status":"-1",
            "msg":"请求IP错误"
        }));
        return;
    }
    var currentDate = util.getDateStrFromTimes(new Date().getTime(),false);
    var orgLevelData = null;
    //开始同步组织机构层级
    async.series([
        //判断是否已经进行了数据同步
        function(cb){
            var redisCli = redis.createClient(global.redisPort,global.redisHost);
            redisCli.on("ready",function(){
                redisCli.select(contactUtil.contactConst.redisDB,function(){
                    redisCli.get("syncOrgLevel",function(err,data){
                        redisCli.quit();
                        if(data == null || data != currentDate){
                            cb(null,"");
                        }else{
                            console.log("has synced on the first server");
                            Response.end("has synced on the first server");
                        }
                    });
                });
            });
        },
        //调用webservice进行数据同步
        function(cb){
			console.log("start invoke webservice");
            var reqJson = {
                "IS_PUBLIC":{
                    "FLOWNO":"",
                    "PERNR":"",
                    "ZDOMAIN":"",
                    "I_PAGENO":"",
                    "I_PAGESIZE":""
                }
            };
            var option = {
                "wsdl":path.join(__dirname.replace(IF.name,""),global.wsdl,"zhrws_org_all.xml"),
                "func":"ZHRWS_ORG_ALL.ZHRWS_ORG_ALL.ZHRWS_ORG_ALL",
                "Params":reqJson,
                "agent":false
            };
            MEAP.SOAP.Runner(option,function(err,res,data){
                if(!err && data.ES_PUBLIC.TYPE == 0 && data.LIST_ORG.item != null && typeof data.LIST_ORG.item == "object"){
                    orgLevelData = data.LIST_ORG.item;
                    cb(null,"");
                }else{
                    console.log("no data found");
                    Response.end("no data found");
                }
            });
        },
        //删除mongodb中的数据
        function(cb){
			console.log("clear orgLevel data");
            var conn = mongoose.createConnection(global.mongodbURL);
            var orgLevelModel = conn.model("base_org_level",contactSchema.BaseOrgLevelSchema);
            orgLevelModel.remove({},function(err){
                conn.close();
                cb(null,"");
            });
        },
        //保存数据到mongodb
        function(cb){
			console.log("save orgLevel to mongodb");
            var conn = mongoose.createConnection(global.mongodbURL);
            var orgLevelModel = conn.model("base_org_level",contactSchema.BaseOrgLevelSchema);
            addOrgLevel(0,conn,orgLevelModel,orgLevelData,cb);
        },
        //设置同步标识
        function(cb){
			console.log("sync orgLevel over");
            var redisCli = redis.createClient(global.redisPort,global.redisHost);
            redisCli.on("ready",function(){
                redisCli.select(contactUtil.contactConst.redisDB,function(){
                    redisCli.set("syncOrgLevel",currentDate,function(err){
                        redisCli.quit();
                        cb(null,"");
                    });
                });
            });
        }
    ],function(err,data){
        Response.end("sync orgLevel over");
    });
}

//保存部门层级信息
function addOrgLevel(i,conn,orgLevelModel,orgLevelData,cb){
    i = i ||0;
    if(i < orgLevelData.length){
        var item = orgLevelData[i];
        var orgLevelObj = new orgLevelModel({
            "OBJID":item.OBJID,
            "ZZ_JGCJ":item.ZZ_JGCJ
        });
        orgLevelObj.save(function(err){
            i++;
            addOrgLevel(i,conn,orgLevelModel,orgLevelData,cb);
        });
    }else{
        conn.close();
        cb(null,"");
    }
}

exports.Runner = run;


                                

	

