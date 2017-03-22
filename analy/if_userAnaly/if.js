var MEAP = require("meap");
var async = require("async");
var util = require("../../base/util.js");

/**
 * 天信用户行为分析
 * @author donghua.wang
 * @date 2015年06月30日
 * SELECT "S_DATE",sum("COUNT_NUM") AS "COUNT_NUM" FROM "_SYS_BIC"."cttqdc.subjects.erp.hr.onjob/CA_EMP_EDU_ONJOB_STAT"
 * ('PLACEHOLDER' = ('$$s_type$$', 'D'),'PLACEHOLDER' = ('$$begda$$', '20150101'),'PLACEHOLDER' = ('$$endda$$', '20150131'))
 * WHERE DEPT04 = '00000403' group by  "S_DATE"
 * */
var arg = null;
var queryYear = null;
var queryMonth = null;
var currentDate = null;
var queryDate = null;
var userId = null;
function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type", "text/json;charset=utf8");
    arg = JSON.parse(Param.body.toString());
    userId = arg.userId;
    if(userId.length = 7){
        userId = "0" + userId;
    }
    queryYear = arg.queryYear;
	queryMonth = arg.queryMonth;
    currentDate = getCurrentDate();
    queryDate = getQueryDate(queryYear,queryMonth);
    if(queryDate > currentDate){
        Response.end(JSON.stringify({
            "status":"-1",
            "msg":"无法查询今天以后的数据"
        }));
        return;
    }
	var op = arg.op;
	if(op == null || op == ''){
		Response.end(JSON.stringify({
			"status":"-1",
			"msg":"传递参数错误"
		}));
		return;
	}
	switch(op){
		case 'analyOnjobCount':
		analyOnjobCount(arg,Response);
		break;
		case 'analyOnjobSex':
		analyOnjobSex(arg,Response);
		break;
		case 'analyOnjobEducation':
		analyOnjobEducation(arg,Response);
		break;
		case 'analyOnjobSiling':
		analyOnjobSiling(arg,Response);
		break;
		case 'analyOnjobAge':
		analyOnjobAge(arg,Response);
		break;
		case 'analyOnjobTecAndDuty':
		analyOnjobTecAndDuty(arg,Response);
		break;
		default:
		Response.end(JSON.stringify({
			"status":"-1",
			"msg":"传递参数错误"
		}));
	}
    
}

//在职人员数量分析
function analyOnjobCount(arg,Response){
    var dept02 = arg.dept02;
    var dept03 = arg.dept03;
    var dept04 = arg.dept04;
    var dept05 = arg.dept05;
    var dept06 = arg.dept06;
	
	var jdbc = new ( require('jdbc') );
    jdbc.initialize(global.hanaConfig, function(err, res) {
    jdbc.open(function(err, conn) {
       if (!err) {
				 var sql = " SELECT  \"HRSTATN\",\"HRTEXT1\", sum(\"COUNT_NUM\")  FROM \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.onjob/CA_EMP_STATUS_ONJOB_STAT\""
				+ " ('PLACEHOLDER' = ('$$s_type$$', 'D'),'PLACEHOLDER' = ('$$userid$$', ':userId'), 'PLACEHOLDER' = ('$$begda$$', ':startDate'), 'PLACEHOLDER' = ('$$endda$$', ':endDate'))"
				+ " where 1 = 1 ";
				if(dept02 != ""){
					sql += " and DEPT02 in (:DEPT02) ";
				}
				if(dept03 != ""){
					sql += " and DEPT03 in (:DEPT03) ";
				}
				if(dept04 != ""){
					sql += " and DEPT04 in (:DEPT04) ";
				}
				if(dept05 != ""){
					sql += " and DEPT05 in (:DEPT05) ";
				}
				if(dept06 != ""){
					sql += " and DEPT06 in (:DEPT06) ";
				}
				sql += "  GROUP BY  \"HRSTATN\", \"HRTEXT1\"";
				sql = sql.replace(":startDate",queryDate).replace(":endDate",queryDate).replace(":DEPT02",dept02).replace(":DEPT03",dept03)
					  .replace(":DEPT04",dept04).replace(":DEPT05",dept05).replace(":DEPT06",dept06).replace(":userId",userId);
				jdbc.executeQuery(sql,function(err,rows){
					jdbc.close(function(err){});
					 var arr = transformData(rows);
					 Response.end(JSON.stringify({
						 "status":"0",
						 "data":arr
					 }));
				 });
          }
        });
    });
}

//在职人员性别分析
function analyOnjobSex(arg,Response){
	var dept02 = arg.dept02;
    var dept03 = arg.dept03;
    var dept04 = arg.dept04;
    var dept05 = arg.dept05;
    var dept06 = arg.dept06;
	
	var jdbc = new ( require('jdbc') );
    jdbc.initialize(global.hanaConfig, function(err, res) {
    jdbc.open(function(err, conn) {
       if (!err) {
				var sql = " SELECT \"GESCH\",\"GESCHT\", sum(\"COUNT_NUM\") FROM \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.onjob/CA_EMP_SEX_ONJOB_STAT\" "
				+ "('PLACEHOLDER' = ('$$s_type$$', 'D'),'PLACEHOLDER' = ('$$userid$$', ':userId'), 'PLACEHOLDER' = ('$$begda$$', ':startDate'), 'PLACEHOLDER' = ('$$endda$$', ':endDate'))"
				+ "  where 1 = 1 ";
				if(dept02 != ""){
					sql += " and DEPT02 in (:DEPT02) ";
				}
				if(dept03 != ""){
					sql += " and DEPT03 in (:DEPT03) ";
				}
				if(dept04 != ""){
					sql += " and DEPT04 in (:DEPT04) ";
				}
				if(dept05 != ""){
					sql += " and DEPT05 in (:DEPT05) ";
				}
				if(dept06 != ""){
					sql += " and DEPT06 in (:DEPT06) ";
				}
				sql += "  GROUP BY \"GESCH\", \"GESCHT\"";
				sql = sql.replace(":startDate",queryDate).replace(":endDate",queryDate).replace(":DEPT02",dept02).replace(":DEPT03",dept03)
				  .replace(":DEPT04",dept04).replace(":DEPT05",dept05).replace(":DEPT06",dept06).replace(":userId",userId);
				jdbc.executeQuery(sql,function(err,rows){
					jdbc.close(function(err){});
					 var arr = transformData(rows);
					 Response.end(JSON.stringify({
						 "status":"0",
						 "data":arr
					 }));
				 });
          }
        });
    });
}

//在职人员学历分析
function analyOnjobEducation(arg,Response){
	var dept02 = arg.dept02;
    var dept03 = arg.dept03;
    var dept04 = arg.dept04;
    var dept05 = arg.dept05;
    var dept06 = arg.dept06;
	
	var jdbc = new ( require('jdbc') );
    jdbc.initialize(global.hanaConfig, function(err, res) {
    jdbc.open(function(err, conn) {
       if (!err) {
	 var sql = " SELECT \"SLART\", \"SLART_DES\", sum(\"COUNT_NUM\")  FROM \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.onjob/CA_EMP_EDU_ONJOB_STAT\""
				+ " ('PLACEHOLDER' = ('$$s_type$$', 'D'),'PLACEHOLDER' = ('$$userid$$', ':userId'), 'PLACEHOLDER' = ('$$begda$$', ':startDate'), 'PLACEHOLDER' = ('$$endda$$', ':endDate'))"
				+ " where 1 = 1 ";
				if(dept02 != ""){
						sql += " and DEPT02 in (:DEPT02) ";
					}
				if(dept03 != ""){
						sql += " and DEPT03 in (:DEPT03) ";
					}
				if(dept04 != ""){
						sql += " and DEPT04 in (:DEPT04) ";
					}
			   if(dept05 != ""){
						sql += " and DEPT05 in (:DEPT05) ";
					}
			   if(dept06 != ""){
						sql += " and DEPT06 in (:DEPT06) ";
					}
				sql +=  " GROUP BY \"SLART\", \"SLART_DES\"";
				sql = sql.replace(":startDate",queryDate).replace(":endDate",queryDate).replace(":DEPT02",dept02).replace(":DEPT03",dept03)
				  .replace(":DEPT04",dept04).replace(":DEPT05",dept05).replace(":DEPT06",dept06).replace(":userId",userId);
				jdbc.executeQuery(sql,function(err,rows){
					jdbc.close(function(err){});
					 var arr = transformData(rows);
					 Response.end(JSON.stringify({
						 "status":"0",
						 "data":arr
					 }));
				 });
          }
        });
    });
}

//在职人员司龄分析
function analyOnjobSiling(arg,Response){
	var dept02 = arg.dept02;
    var dept03 = arg.dept03;
    var dept04 = arg.dept04;
    var dept05 = arg.dept05;
    var dept06 = arg.dept06;
	
	var jdbc = new ( require('jdbc') );
    jdbc.initialize(global.hanaConfig, function(err, res) {
    jdbc.open(function(err, conn) {
       if (!err) {
				var sql = "SELECT \"SL_ID\",\"SL_NAME\", sum(\"COUNT_NUM\") FROM \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.onjob/CA_EMP_SL_ONJOB_STAT\""
				+ " ('PLACEHOLDER' = ('$$s_type$$', 'D'),'PLACEHOLDER' = ('$$userid$$', ':userId'), 'PLACEHOLDER' = ('$$begda$$', ':startDate'), 'PLACEHOLDER' = ('$$endda$$', ':endDate'))"
					+ "  where 1 = 1 ";
				 if(dept02 != ""){
						sql += " and DEPT02 in (:DEPT02) ";
					}
				if(dept03 != ""){
						sql += " and DEPT03 in (:DEPT03) ";
					}
				if(dept04 != ""){
						sql += " and DEPT04 in (:DEPT04) ";
					}
				if(dept05 != ""){
						sql += " and DEPT05 in (:DEPT05) ";
					}
				if(dept06 != ""){
						sql += " and DEPT06 in (:DEPT06) ";
					}
				sql += "  GROUP BY \"SL_ID\",\"SL_NAME\"";
				sql = sql.replace(":startDate",queryDate).replace(":endDate",queryDate).replace(":DEPT02",dept02).replace(":DEPT03",dept03)
				  .replace(":DEPT04",dept04).replace(":DEPT05",dept05).replace(":DEPT06",dept06).replace(":userId",userId);
				jdbc.executeQuery(sql,function(err,rows){
					jdbc.close(function(err){});
					 var arr = transformData(rows);
					 Response.end(JSON.stringify({
						 "status":"0",
						 "data":arr
					 }));
				 });
          }
        });
    });
}

//在职人员年龄分析
function analyOnjobAge(arg,Response){
	var dept02 = arg.dept02;
    var dept03 = arg.dept03;
    var dept04 = arg.dept04;
    var dept05 = arg.dept05;
    var dept06 = arg.dept06;
	
	var jdbc = new ( require('jdbc') );
    jdbc.initialize(global.hanaConfig, function(err, res) {
    jdbc.open(function(err, conn) {
       if (!err) {
				var sql = "SELECT  \"AGE_ID\",\"AGE_NAME\", sum(\"COUNT_NUM\")  FROM \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.onjob/CA_EMP_AGE_ONJOB_STAT\""
				+ " ('PLACEHOLDER' = ('$$s_type$$', 'D'),'PLACEHOLDER' = ('$$userid$$', ':userId'), 'PLACEHOLDER' = ('$$begda$$', ':startDate'), 'PLACEHOLDER' = ('$$endda$$', ':endDate'))"
				+ " where 1 = 1 ";
				if(dept02 != ""){
						sql += " and DEPT02 in (:DEPT02) ";
					}
				if(dept03 != ""){
						sql += " and DEPT03 in (:DEPT03) ";
					}
				if(dept04 != ""){
						sql += " and DEPT04 in (:DEPT04) ";
					}
			   if(dept05 != ""){
						sql += " and DEPT05 in (:DEPT05) ";
					}
			   if(dept06 != ""){
						sql += " and DEPT06 in (:DEPT06) ";
					}
				sql  +=  "  GROUP BY \"AGE_ID\", \"AGE_NAME\"";
				sql = sql.replace(":startDate",queryDate).replace(":endDate",queryDate).replace(":DEPT02",dept02).replace(":DEPT03",dept03)
				  .replace(":DEPT04",dept04).replace(":DEPT05",dept05).replace(":DEPT06",dept06).replace(":userId",userId);
				jdbc.executeQuery(sql,function(err,rows){
					jdbc.close(function(err){});
					 var arr = transformData(rows);
					 Response.end(JSON.stringify({
						 "status":"0",
						 "data":arr
					 }));
				 });
          }
        });
    });
}

//在职人员技能分析
function analyOnjobTecAndDuty(arg,Response){
	var dept02 = arg.dept02;
    var dept03 = arg.dept03;
    var dept04 = arg.dept04;
    var dept05 = arg.dept05;
    var dept06 = arg.dept06;
	
	var jdbc = new ( require('jdbc') );
    jdbc.initialize(global.hanaConfig, function(err, res) {
    jdbc.open(function(err, conn) {
       if (!err) {
				var sql = "SELECT \"TYPESC\",  \"TYPEST\", sum(\"COUNT_NUM\")  FROM \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.onjob/CA_EMP_POSITION_ONJOB_STAT\""
                + " ('PLACEHOLDER' = ('$$s_type$$', 'D'),'PLACEHOLDER' = ('$$userid$$', ':userId'), 'PLACEHOLDER' = ('$$begda$$', ':startDate'), 'PLACEHOLDER' = ('$$endda$$', ':endDate'))"
                + " where 1 = 1 ";
				if(dept02 != ""){
						sql += " and DEPT02 in (:DEPT02) ";
					}
			   if(dept03 != ""){
						sql += " and DEPT03 in (:DEPT03) ";
					}
			   if(dept04 != ""){
						sql += " and DEPT04 in (:DEPT04) ";
					}
			   if(dept05 != ""){
						sql += " and DEPT05 in (:DEPT05) ";
					}
			   if(dept06 != ""){
						sql += " and DEPT06 in (:DEPT06) ";
					}
				sql  +=  " GROUP BY \"TYPESC\",  \"TYPEST\"";
				sql = sql.replace(":startDate",queryDate).replace(":endDate",queryDate).replace(":DEPT02",dept02).replace(":DEPT03",dept03)
				  .replace(":DEPT04",dept04).replace(":DEPT05",dept05).replace(":DEPT06",dept06).replace(":userId",userId);
				jdbc.executeQuery(sql,function(err,rows){
					jdbc.close(function(err){});
					 var arr = transformData(rows);
					 Response.end(JSON.stringify({
						 "status":"0",
						 "data":arr
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

/**
 * 根据查询月份计算统计的时间，如果是今年以前的月份，则统计月份的最后一天的数据，如果是当前月，则统计今日的数据
 * @param year 统计 年份
 * @param month  统计月份
 * @return string
 * */
function getQueryDate(year,month){
    var days31 = [1,3,5,7,8,10,12];
    var days30 = [4,6,9,10];
    var yearInt = parseInt(year);
    var monthInt = parseInt(month);
    var date = null;
    if(util.inArray(monthInt,days31) != -1){
        date = 31;
    }else if(util.inArray(monthInt,days30) != -1){
        date = 30;
    }else{
        date = 28;
        if((yearInt%4 ==0 && yearInt%100!=0) || yearInt%400 == 0){
            date = 29;
        }
    }
    var currentMonth = new Date().getMonth() + 1;
    if(currentMonth == monthInt){
        date = new Date().getDate();
        if(date <10){
            date = "0" + date;
        }
    }
    return year + month + date + "";
}

/**
 * 得返回的结果集进行处理
 * */
function transformData(rows){
    var arr = [];
    for(var i in rows){
        var row = rows[i];
        for(var j in row){
             if(j.indexOf("SUM") >= 0){
               row.count = row[j];
               delete row[j];
               break;
              }
         }
        arr.push(row);
     }
     return arr;
}

function handleResult(err,rows){
    var arr = [];
    for(var i in rows){
        var row = rows[i];
        for(var j in row){
             if(j.indexOf("SUM") >= 0){
               row.count = row[j];
               delete row[j];
               break;
              }
         }
        arr.push(row);
     }
     result.push(arr);
}

exports.Runner = run;

