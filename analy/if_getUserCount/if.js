var MEAP=require("meap");
var async = require("async");
var util = require("../../base/util.js");

function run(Param, Robot, Request, Response, IF)
{
    var jdbc = new ( require('jdbc') );
    jdbc.initialize(global.hanaConfig, function(err, res) {
    jdbc.open(function(err, conn) {
       if (!err) {
         var sql = "SELECT  \"DEPT02\", \"DEPTN02\",  sum(\"COUNT_NUM\")  FROM \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.onjob/CA_EMP_ONJOB_STAT\""
            + " ('PLACEHOLDER' = ('$$s_type$$', 'D'), 'PLACEHOLDER' = ('$$begda$$', ':startDate'), 'PLACEHOLDER' = ('$$endda$$', ':endDate'))"
            + "  WHERE DEPT02 not in ('00000020','00000021','00000022','00000023','00000024') GROUP BY  \"DEPT02\",\"DEPTN02\"";
          var dateStr = getCurrentDate();
          sql = sql.replace(":startDate",dateStr).replace(":endDate",dateStr);
          console.log("sql--->",sql);
          jdbc.executeQuery(sql,function(err,rows){
                jdbc.close(function(err){});
                Response.setHeader("Content-Type", "text/json;charset=utf8");
                Response.end(JSON.stringify({
                    "status":"0",
                    "msg":"查询处成功",
                    "data":rows
                }));
             });
            }
        });
    });
}

/**
 * 计算当前日期，返回格式:yyyyMMdd
 * */
function getCurrentDate(){
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    if(month < 10){
        month = '0' + month;
    }
    var currentDate = date.getDate();
    if(currentDate < 10){
        currentDate = '0' + currentDate;
    }
    var dateStr =  "" + year + month + currentDate;
    return dateStr;
}

exports.Runner = run;


                                

	

