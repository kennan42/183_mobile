var MEAP=require("meap");
var util = require("../../base/util.js");

//HR下级部门人员分析
var level = null;
var startDate = null;
var endDate = null;
var userId = null;
var queryDate = null;
function run(Param, Robot, Request, Response, IF)
{
    Response.setHeader("Content-Type","text/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
	level = arg.level;
    userId = arg.userId;
    if (userId.length == 7) {
        userId = "0" + userId;
    }
    var currentDate = getCurrentDate();
    var queryYear = arg.queryYear;
    var queryMonth = arg.queryMonth;
    queryDate = getQueryDate(queryYear, queryMonth);
    if (queryDate > currentDate) {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "无法查询今天以后的数据"
        }));
        return;
    }
    var op = arg.op;
    if (op == null || op == '') {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "传递参数错误"
        }));
        return;
    }
    switch(op) {
    case 'analyOnjobCount':
        analyOnjobCount(arg, Response);
        break;
    case 'analyOnjobSex':
        analyOnjobSex(arg, Response);
        break;
    case 'analyOnjobEducation':
        analyOnjobEducation(arg, Response);
        break;
    case 'analyOnjobSiling':
        analyOnjobSiling(arg, Response);
        break;
    case 'analyOnjobAge':
        analyOnjobAge(arg, Response);
        break;
    case 'analyOnjobTecAndDuty':
        analyOnjobTecAndDuty(arg, Response);
        break;
    default:
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "传递参数错误"
        }));
    }
}

//在职人员数量分析
function analyOnjobCount(arg, Response){
    var childLevel = "0" +  (parseInt(level) + 1);
    var parentDept = "DEPT" + level;
    var childDept = "DEPT" + childLevel;
    var childDeptName  = "DEPTN" + childLevel;
    var parentDeptCodes = arg.parentDeptCodes;
    var childDeptCodes = arg.childDeptCodes;
    var jdbc = new ( require('jdbc') );
    jdbc.initialize(global.hanaConfig, function(err, res) {
        var sql = " SELECT \":deptCode\",\":deptName\",sum(\"COUNT_NUM\") AS \"COUNT_NUM\" "
                + " FROM \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.onjob/CA_EMP_STATUS_ONJOB_STAT\" "
                + " ('PLACEHOLDER' = ('$$s_type$$', 'D'), 'PLACEHOLDER' = ('$$begda$$', ':startDate'), "
                + " 'PLACEHOLDER' = ('$$endda$$', ':endDate'), 'PLACEHOLDER' = ('$$userid$$', ':userId')) "
                + " WHERE  \":parentDeptCode\" IN (:parentDeptCodes) " 
                + " AND \":childDeptCode\" NOT IN (:parentDeptCodes) "
         if(childDeptCodes != ""){
             sql += " AND \":childDeptCode\" IN (:childDeptCodes) ";
         }
         
         sql += " GROUP BY \":deptCode\",\":deptName\" order by \"COUNT_NUM\" desc ";
         sql = sql.replace(":deptCode",childDept).replace(":deptCode",childDept)
               .replace(":deptName",childDeptName).replace(":deptName",childDeptName)
               .replace(":startDate",queryDate).replace(":endDate",queryDate).replace(":userId",userId)
               .replace(":parentDeptCode",parentDept).replace(":parentDeptCodes",parentDeptCodes).
                replace(":childDeptCode",childDept).replace(":childDeptCode",childDept)
               .replace(":childDeptCodes",childDeptCodes).replace(":parentDeptCodes",parentDeptCodes);
         console.log(sql);
        jdbc.open(function(err, conn) {
            jdbc.executeQuery(sql, function(err, rows) {
                jdbc.close(function(err) {});
                var rs = handleResult(rows);
                Response.end(JSON.stringify({
                    "status" : "0",
                    "data" : rs
                }));
            });
        });
    });
}

//在职人员性别分析
function analyOnjobSex(arg, Response){
    var jdbc = new ( require('jdbc') );
    var childLevel = "0" +  (parseInt(level) + 1);
    var parentDept = "DEPT" + level;
    var childDept = "DEPT" + childLevel;
    var parentDeptCodes = arg.parentDeptCodes;
    var childDeptCodes = arg.childDeptCodes;
    jdbc.initialize(global.hanaConfig, function(err, res) {
        jdbc.open(function(err, conn) {
            var sql = " SELECT \"GESCH\", \"GESCHT\",sum(\"COUNT_NUM\") AS \"COUNT_NUM\" "
                    + " FROM \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.onjob/CA_EMP_SEX_ONJOB_STAT\" "
                    + " ('PLACEHOLDER' = ('$$s_type$$', 'D'), 'PLACEHOLDER' = ('$$begda$$', ':startDate'), "
                    + " 'PLACEHOLDER' = ('$$endda$$', ':endDate'), 'PLACEHOLDER' = ('$$userid$$', ':userId')) "
                    + " WHERE \":parentDept\" IN (:parentDeptCodes) AND \":childDeptCode\" NOT IN (:parentDeptCodes) ";
            if(childDeptCodes != ""){
                sql += " AND \":childDeptCode\" IN (:childDeptCodes) ";
            }
            sql += " GROUP BY \"GESCH\", \"GESCHT\" ORDER BY \"COUNT_NUM\" desc ";
            sql = sql.replace(":startDate",queryDate).replace(":endDate",queryDate).replace(":userId",userId)
                  .replace(":parentDept",parentDept).replace(":parentDeptCodes",parentDeptCodes).replace(":parentDeptCodes",parentDeptCodes)
                  .replace(":childDeptCode",childDept).replace(":childDeptCode",childDept).replace(":childDeptCodes",childDeptCodes);
            console.log(sql);
            jdbc.executeQuery(sql, function(err, rows) {
                jdbc.close(function(err) {});
                var rs = handleResult(rows);
                Response.end(JSON.stringify({
                    "status" : "0",
                    "data" : rs
                }));
            });
        });
    });
}

//在职人员学历分析
function analyOnjobEducation(arg, Response){
    var childLevel = "0" +  (parseInt(level) + 1);
    var parentDept = "DEPT" + level;
    var childDept = "DEPT" + childLevel;
    var parentDeptCodes = arg.parentDeptCodes;
    var childDeptCodes = arg.childDeptCodes;
    var jdbc = new ( require('jdbc') );
    jdbc.initialize(global.hanaConfig, function(err, res) {
        jdbc.open(function(err, conn) {
            var sql = " SELECT \"SLART\",\"SLART_DES\",sum(\"COUNT_NUM\") AS \"COUNT_NUM\" "
                    + " FROM  \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.onjob/CA_EMP_EDU_ONJOB_STAT\" "
                    + " ('PLACEHOLDER' = ('$$s_type$$', 'D'), 'PLACEHOLDER' = ('$$begda$$', ':startDate'), "
                    + " 'PLACEHOLDER' = ('$$endda$$', ':endDate'), 'PLACEHOLDER' = ('$$userid$$', ':userId')) "
                    + " WHERE \":parentDept\" in (:parentDeptCodes)  and \":childDept\" not in (:parentDeptCodes) "
            if(childDeptCodes != ""){
                sql += " and \":childDept\" in (:childDeptCodes) ";
            }
            sql += " GROUP BY \"SLART\",\"SLART_DES\" order by \"COUNT_NUM\" desc ";
            sql=sql.replace(":startDate",queryDate).replace(":endDate",queryDate).replace(":userId",userId)
                .replace(":parentDept",parentDept).replace(":parentDeptCodes",parentDeptCodes).replace(":childDept",childDept).replace(":parentDeptCodes",parentDeptCodes)
                .replace(":childDept",childDept).replace(":childDeptCodes",childDeptCodes)
            console.log(sql);
            jdbc.executeQuery(sql, function(err, rows) {
                jdbc.close(function(err) {});
                var rs = handleResult(rows);
                Response.end(JSON.stringify({
                    "status" : "0",
                    "data" : rs
                }));
            });
        });
    });
}

//在职人员司龄分析
function analyOnjobSiling(arg, Response){
    var childLevel = "0" +  (parseInt(level) + 1);
    var parentDept = "DEPT" + level;
    var childDept = "DEPT" + childLevel;
    var parentDeptCodes = arg.parentDeptCodes;
    var childDeptCodes = arg.childDeptCodes;
    var jdbc = new ( require('jdbc') );
    jdbc.initialize(global.hanaConfig, function(err, res) {
        jdbc.open(function(err, conn) {
            var sql = " SELECT \"SL_ID\", \"SL_NAME\",sum(\"COUNT_NUM\") AS \"COUNT_NUM\" "
                    + " FROM  \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.onjob/CA_EMP_SL_ONJOB_STAT\" "
                    + " ('PLACEHOLDER' = ('$$s_type$$', 'D'), 'PLACEHOLDER' = ('$$begda$$', ':startDate'), "
                    + " 'PLACEHOLDER' = ('$$endda$$', ':endDate'), 'PLACEHOLDER' = ('$$userid$$', ':userId')) "
                    + " WHERE \":parentDept\" in (:parentDeptCodes) and \":childDept\" not in (:parentDeptCodes) ";
            if(childDeptCodes != ""){
                sql += " and \":childDept\" in (:childDeptCodes) ";
            }
            sql += " GROUP BY \"SL_ID\", \"SL_NAME\" order by \"COUNT_NUM\"  desc ";
            sql=sql.replace(":startDate",queryDate).replace(":endDate",queryDate).replace(":userId",userId)
                    .replace(":parentDept",parentDept).replace(":parentDeptCodes",parentDeptCodes).replace(":parentDeptCodes",parentDeptCodes).replace(":childDept",childDept)
                    .replace(":childDept",childDept).replace(":childDeptCodes",childDeptCodes);
            console.log(sql);
            jdbc.executeQuery(sql, function(err, rows) {
                jdbc.close(function(err) {});
                var rs = handleResult(rows);
                Response.end(JSON.stringify({
                    "status" : "0",
                    "data" : rs
                }));
            });
        });
    });
}

//在职人员年龄分析
function analyOnjobAge(arg, Response){
    var childLevel = "0" +  (parseInt(level) + 1);
    var parentDept = "DEPT" + level;
    var childDept = "DEPT" + childLevel;
    var parentDeptCodes = arg.parentDeptCodes;
    var childDeptCodes = arg.childDeptCodes;
    var jdbc = new ( require('jdbc') );
    jdbc.initialize(global.hanaConfig, function(err, res) {
        jdbc.open(function(err, conn) {
            var sql = " SELECT \"AGE_ID\",\"AGE_NAME\",sum(\"COUNT_NUM\") AS \"COUNT_NUM\" "
                    + " FROM  \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.onjob/CA_EMP_AGE_ONJOB_STAT\" "
                    + " ('PLACEHOLDER' = ('$$s_type$$', 'D'), 'PLACEHOLDER' = ('$$begda$$', ':startDate'), "
                    + " 'PLACEHOLDER' = ('$$endda$$', ':endDate'), 'PLACEHOLDER' = ('$$userid$$', ':userId')) "
                    + " WHERE \":parentDept\" in (:parentDeptCodes) and \":childDept\" not in (:parentDeptCodes) ";
            if(childDeptCodes != ""){
                sql += " and \":childDept\" in (:childDeptCodes) ";
            }      
            sql += " GROUP BY \"AGE_ID\",\"AGE_NAME\" order by \"COUNT_NUM\" desc ";
            sql = sql.replace(":startDate",queryDate).replace(":endDate",queryDate).replace(":userId",userId)
                 .replace(":parentDept",parentDept).replace(":parentDeptCodes",parentDeptCodes).replace(":parentDeptCodes",parentDeptCodes)
                 .replace(":childDept",childDept).replace(":childDept",childDept).replace(":childDeptCodes",childDeptCodes);  
            console.log(sql);
            jdbc.executeQuery(sql, function(err, rows) {
                jdbc.close(function(err) {});
                var rs = handleResult(rows);
                Response.end(JSON.stringify({
                    "status" : "0",
                    "data" : rs
                }));
            });
        });
    });
}

//在职人员技能分析
function analyOnjobTecAndDuty(arg, Response){
    var childLevel = "0" +  (parseInt(level) + 1);
    var parentDept = "DEPT" + level;
    var childDept = "DEPT" + childLevel;
    var parentDeptCodes = arg.parentDeptCodes;
    var childDeptCodes = arg.childDeptCodes;
    var jdbc = new ( require('jdbc') );
    jdbc.initialize(global.hanaConfig, function(err, res) {
        jdbc.open(function(err, conn) {
            var sql = " SELECT \"TYPESC\",\"TYPEST\",sum(\"COUNT_NUM\") AS \"COUNT_NUM\" "
                    + " FROM  \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.onjob/CA_EMP_POSITION_ONJOB_STAT\" "
                    + " ('PLACEHOLDER' = ('$$s_type$$', 'D'), 'PLACEHOLDER' = ('$$begda$$', ':startDate'), "
                    + " 'PLACEHOLDER' = ('$$endda$$', ':endDate'), 'PLACEHOLDER' = ('$$userid$$', ':userId')) "
                    + " WHERE \":parentDept\" in (:parentDeptCodes) and \":childDept\" not in (:parentDeptCodes) "
            if(childDeptCodes != ""){
                sql += " and \":childDept\" in (:childDeptCodes) ";
            }
            sql += " GROUP BY  \"TYPESC\",\"TYPEST\" order by \"COUNT_NUM\" desc ";   
			sql=sql.replace(":startDate",queryDate).replace(":endDate",queryDate).replace(":userId",userId).replace(":parentDept",parentDept).replace(":parentDeptCodes",parentDeptCodes).replace(":parentDeptCodes",parentDeptCodes).replace(":childDept",childDept).replace(":childDept",childDept).replace(":childDeptCodes",childDeptCodes);
            console.log(sql);
            jdbc.executeQuery(sql, function(err, rows) {
                jdbc.close(function(err) {});
				var rs = handleResult(rows);
                Response.end(JSON.stringify({
                    "status" : "0",
                    "data" : rs
                }));
            });
        });
    });
}


/**
 * 计算当前日期，返回格式:yyyyMMdd
 * */
function getCurrentDate() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    if (month < 10) {
        month = '0' + month;
    }
    var currentDate = date.getDate();
    if (currentDate < 10) {
        currentDate = '0' + currentDate;
    }
    var dateStr = "" + year + month + currentDate;
    return dateStr;
}

/**
 * 判断数组arr中是否存在某个对象key的值为val
 * @param key
 * @param val
 * @param arr
 * @return true存在   false不存在
 * */
function inArray(key, val, arr) {
    for (var i in arr) {
        var item = arr[i];
        if (item[key] == val) {
            return true;
        }
    }
    return false;
}

/**
 * 根据查询月份计算统计的时间，如果是今年以前的月份，则统计月份的最后一天的数据，如果是当前月，则统计今日的数据
 * @param year 统计 年份
 * @param month  统计月份
 * @return string
 * */
function getQueryDate(year, month) {
    var days31 = [1, 3, 5, 7, 8, 10, 12];
    var days30 = [4, 6, 9, 10];
    var yearInt = parseInt(year);
    var monthInt = parseInt(month);
    var date = null;
    if (util.inArray(monthInt, days31) != -1) {
        date = 31;
    } else if (util.inArray(monthInt, days30) != -1) {
        date = 30;
    } else {
        date = 28;
        if ((yearInt % 4 == 0 && yearInt % 100 != 0) || yearInt % 400 == 0) {
            date = 29;
        }
    }
    var currentMonth = new Date().getMonth() + 1;
    if (currentMonth == monthInt) {
        date = new Date().getDate();
        if (date < 10) {
            date = "0" + date;
        }
    }
    return year + month + date + "";
}

function handleResult(rs){
    var arr = [];
    for(var i in rs){
        var item = rs[i];
        for(var j in item){
            if(j.toUpperCase().indexOf("SUM")!= -1){
                item.count = item[j];
                delete item[j];
            }
        }
        arr.push(item);
    }
    return arr;
}

exports.Runner = run;


                                

	

