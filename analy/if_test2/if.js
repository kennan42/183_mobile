var MEAP = require("meap");
var async = require("async");
var REDIS = require("meap_redis");
var common = require("../common.js"); 

function run(Param, Robot, Request, Response, IF)
{
  Response.setHeader("Content-Type", "text/json;charset=utf-8");
  
   var arg = JSON.parse(Param.body.toString());
  
   
 var sql = "select \"PARNR\",\"VBELN\",\"ERDAT\",\"KUNNR\", "
+ "\"NAME1\",\"STATUS\",\"ADRRS\",\"AUART\", "
+ " sum(\"KZWIC\") \"KZWIC\",count(*)over() \"COUNT\" "
+ "FROM \"_SYS_BIC\".\"cttqdc.metadata.erp.sd.saledoc/CA_ORDERS_BY_LIST\" " 
+"('PLACEHOLDER' = ('$$P_VBELN$$', '**'), 'PLACEHOLDER' = ('$$P_NAME$$', '*苏州*'))"
+" group by \"PARNR\",\"VBELN\",\"ERDAT\",\"KUNNR\", "
+ " \"NAME1\",\"STATUS\",\"ADRRS\",\"AUART\" " ;


var sql2 ="select \"KUNNR\", \"VKORG\", \"MATNR\", \"MAKTX\", \"BZGG\", \"GGXH\", \"MSEHL\", sum(\"KBETR\") \"KBETR\","
+ " count(*) over() \"COUNT\" from \"_SYS_BIC\".\"cttqdc.metadata.erp.sd.saledoc/CA_ORDERS_BY_MONTH\" where \"ERDAT\" >= '20150101' " 

+" group by \"KUNNR\", \"VKORG\",  \"MATNR\", \"MAKTX\", \"BZGG\",  \"GGXH\", \"MSEHL\"  ";




 var content = "analytest~01"  ;
 
 console.log(sql);
 
  var jdbc = new ( require('jdbc') );
 
          //  var HANAVisitLog = {};
          //  HANAVisitLog.type = type;
          //  HANAVisitLog.module = module;
          //  HANAVisitLog.params = JSON.stringify(arg);
          //  HANAVisitLog.HANAInit = new Date().getTime();
            console.info(new Date().getTime() + "\tHANA连接初始化");
            jdbc.initialize(global.hanaConfig, function (err, res) {
                if (err != null) {
                    errorLog(Response, err, "JDBC INIT ERROR！");
                    return;
                }
               // HANAVisitLog.HANAOpen = new Date().getTime();
                console.info(new Date().getTime() + "\tHANA初始化完毕，打开连接");
                jdbc.open(function (err, conn) {
                    if (err != null) {
                        errorLog(Response, err, "JDBC OPEN ERROR！");
                        return;
                    }
                   // HANAVisitLog.HANATimeQueryBegin = new Date().getTime();
                    console.info(new Date().getTime() + "\t连接打开完毕，开始执行SQL");
                    jdbc.executeQuery(sql, function (err, rows) {
                        if (err != null) {
                            errorLog(Response, err, "JDBC EXECUTE ERROR！");
                            return;
                        }
                      //  HANAVisitLog.HANATimeQueryEnd = new Date().getTime();
                        console.info(new Date().getTime() + "\tSQL 执行完毕，开始处理数据");
                        jdbc.close(function (err) {
                            if (err != null) {
                                errorLog(Response, err, "JDBC CLOSE ERROR！");
                                return;
                            }
                        });
                       // rs = handleMoveResult(rows, keys);
                        console.info(new Date().getTime() + "\t数据处理完毕");
                        Response.end(JSON.stringify({
                            "status": "0",
                            "data": rows
                        }));

                      //  saveHANAVisitLog(HANAVisitLog);

                       // cb(null, "");
                    });
                });
            });
 
 // common.getHANAData(content, sql, Response, keys, arg, "increase", "department");
  
  
  //  Response.end(JSON.stringify({status:0, message:"Success"})); 
}

function errorLog(Response, err, msg) {
    console.info(msg, err);
    Response.end(JSON.stringify({
        "status": "1",
        "data": []
    }));
}

exports.Runner = run;