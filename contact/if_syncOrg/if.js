var MEAP=require("meap");
var redis = require("meap_redis");
var mongoose = require("mongoose");
var h2p = require("hanzi_to_pinyin");
var ContactSchema = require("../Contact.js");
var util = require("../../base/util.js");
var path = require("path");
var async = require("async");
var contactUtil = require("../util.js");

/**
 * 从cttq全量同步组织机构数据，PRD分别在145，150上启动同步程序，
 * 如果145已经同步成功，则150上不再进行数据同步
 * 1 判断今天是否已经进行了数据同步（syncOrg:2008-08-08）
 * 2 调用webservice查询组织机构数据
 * 3 如果查询到数据，则删除旧数据，插入新数据
 * 4 设置redis，表示今天已经进行了组织机构的同步（syncOrg:2008-08-08）
 * @author donghua.wang
 * @date 2015年8月27日 15:56
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
    var orgData = null;
    //开始数据同步
    async.series([
        //判断是否已经进行了数据同步
        function(cb){
            var redisCli = redis.createClient(global.redisPort,global.redisHost);
            redisCli.on("ready",function(){
                redisCli.select(contactUtil.contactConst.redisDB,function(){
                    redisCli.get("syncOrg",function(err,data){
                        redisCli.quit();
                        if(data == null || data != currentDate){//进行数据同步
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
            var reqParam = {
              "IS_PUBLIC":{
                  "FLOWNO":"",
                  "PERNR":"",
                  "ZDOMAIN":"",
                  "I_PAGENO":"",
                  "I_PAGESIZE":""
              },
              "P_ORGEH":{
                  "item":[{"ORGEH":"00000001"}]
              },
              "READ_LEVEL":"99"  
            };
            var option = {
                "wsdl":path.join(__dirname.replace(IF.name,""),global.wsdl,"zhrws_org.xml"),
                "func":"ZHRWS_ORG.ZHRWS_ORG.ZHRWS_ORG",
                "Params":reqParam,
                "agent":false
            };
            MEAP.SOAP.Runner(option,function(err,res,data){
                if(!err && data.ES_PUBLIC.TYPE == '0' && typeof  data.ET_ORG_INFO.item == "object"
					&& data.ET_ORG_INFO.item.length > 0){
                    orgData = data.ET_ORG_INFO.item;
                    cb(null,"");
                }
            });
            
        },
        //删除mongodb中旧的组织机构数据
        function(cb){
            var conn = mongoose.createConnection(global.mongodbURL);
            var orgModel = conn.model("base_org",ContactSchema.BaseOrgSchema);
            orgModel.remove({},function(err,data){
                conn.close();
                cb(null,"");
            });
        },
        //将新的组织机构数据存储到mongodb中
        function(cb){
            var conn = mongoose.createConnection(global.mongodbURL);
            var orgModel = conn.model("base_org",ContactSchema.BaseOrgSchema);
            addOrg(0,orgData,conn,orgModel,cb);
        },
        //设置数据同步标识
        function(cb){
            var redisCli = redis.createClient(global.redisPort,global.redisHost);
            redisCli.on("ready",function(){
                redisCli.select(contactUtil.contactConst.redisDB,function(){
                    redisCli.set("syncOrg",currentDate,function(err){
                        redisCli.quit();
						Response.end("sync org over");
                        cb(null,"");
                    });
                });
            });
        }
    ],function(err,data){
        console.log("sync org over");
    });
}

function addOrg(i,orgs,conn,orgModel,cb){
    i = i||0;
    if(i < orgs.length){
        var org = orgs[i];
		var ZZ_OBJT = org.ZZ_OBJT;
		var ZZ_OBJT1 = org.ZZ_OBJT;
		ZZ_OBJT1 = ZZ_OBJT1.replace(/\(/g,"").replace(/\)/g,"").replace(/\（/g,"").replace(/\）/g,"");
		var ZZ_OBJP =  h2p.hanzi_to_pinyin(ZZ_OBJT1);
		ZZ_OBJP = ZZ_OBJP.replace(/;/g,"")
		var ZZ_SUB_OBJT = org.ZZ_SUB_OBJT;
		var ZZ_SUB_OBJP = h2p.hanzi_to_pinyin(ZZ_SUB_OBJT);
		ZZ_SUB_OBJP = ZZ_SUB_OBJP.replace(/;/g,"")
        var orgObj = new orgModel({
            "ZZ_OTYPE":org.ZZ_OTYPE,
            "ZZ_OBJ":org.ZZ_OBJ,
            "ZZ_OBJT":org.ZZ_OBJT,
			"ZZ_OBJP":ZZ_OBJP,
            "ZZ_SUB_OTYPE":org.ZZ_SUB_OTYPE,
            "ZZ_SUB_OBJ":org.ZZ_SUB_OBJ,
            "ZZ_SUB_OBJT":org.ZZ_SUB_OBJT,
			"ZZ_SUB_OBJP":ZZ_SUB_OBJP,
            "ZZ_OBJ_LEVEL":org.ZZ_OBJ_LEVEL,
            "ZZ_BMFZR":org.ZZ_BMFZR,
            "ZZ_BMFZR_XM":org.ZZ_BMFZR_XM
        });
        orgObj.save(function(err){
            i++;
            addOrg(i,orgs,conn,orgModel,cb);
        });
    }else{
        conn.close();
        cb(null,"");
    }
}

exports.Runner = run;


                                

	

