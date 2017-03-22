var MEAP = require("meap");
var crypto = require('crypto');
var util = require("../../base/util.js");

/**
 * 在职员工分析
 * */
var userId = null;
function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type","text/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
    userId = arg.userId;
    if (userId.length == 7) {
        userId = "0" + userId;
    }
    var currentDate = getCurrentDate();
    var queryYear = arg.queryYear;
    var queryMonth = arg.queryMonth;
    var queryDate = getQueryDate(queryYear, queryMonth);
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
    case 'hasAuth':
        hasAuth(arg, Response);
        break;
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

//判断用户是否有权限查看报表
function hasAuth(arg, Response) {
    var jdbc = new ( require('jdbc') );
    jdbc.initialize(global.hanaConfig, function(err, res) {
        jdbc.open(function(err, conn) {
            var sql = " SELECT MIN(\"HIER\") F1 FROM \"_SYS_BIC\".\"cttqdc.metadata.erp.hr.basedata/CA_EMPLOYEE_SUBDEPT_SPEC\" "
                    + " WHERE \"UID\" = ':userId' ";
            sql = sql.replace(":userId",userId);
            console.log(sql);
            jdbc.executeQuery(sql, function(err, rows) {
                jdbc.close(function(err) {});
                var rs = rows[0];
                var level = "";//如果level为""，则没有权限
                for(var i in rs){
                    level = rs[i];
                }
                Response.end(JSON.stringify({
                    "status" : "0",
                    "level" : level
                }));
            });
        });
    });
}

//在职人员数量分析
function analyOnjobCount(arg, Response) {
    var level = arg.level;
    var deptCode = "DEPT" + level;
    var deptName = "DEPTN" + level;
    var deptCodes = arg.deptCodes;
    var queryYear = arg.queryYear;
    var queryMonth = arg.queryMonth;
    var queryDate = getQueryDate(queryYear, queryMonth);
    var jdbc = new ( require('jdbc') );
    
    jdbc.initialize(global.hanaConfig, function(err, res) {
        jdbc.open(function(err, conn) {
            var sql = " SELECT \":deptCode\",\":deptName\",sum(\"COUNT_NUM\") AS \"COUNT_NUM\"  "
                    + " FROM \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.onjob/CA_EMP_STATUS_ONJOB_STAT\" "
                    + " ('PLACEHOLDER' = ('$$s_type$$', 'D'), 'PLACEHOLDER' =   ('$$begda$$', ':startDate'), " 
                    + " 'PLACEHOLDER' = ('$$endda$$', ':endDate'), 'PLACEHOLDER' = ('$$userid$$', ':userId')) "
                    + " WHERE 1 = 1 ";
            if(deptCodes != ""){
                sql += " AND \":deptCode\" in (:deptCodes) ";
            }
            sql += " GROUP BY \":deptCode\",\":deptName\" order by \"COUNT_NUM\" DESC ";
            sql = sql.replace(":deptCode",deptCode).replace(":deptName",deptName).replace(":startDate",queryDate)
                  .replace(":endDate",queryDate).replace(":userId",userId).replace(":deptCodes",deptCodes)
                  .replace(":deptCode",deptCode).replace(":deptName",deptName);
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

//在职人员性别分析
function analyOnjobSex(arg, Response) {
    var level = arg.level;
    var deptCode = "DEPT" + level;
    var deptName = "DEPTN" + level;
    var deptCodes = arg.deptCodes;
    var queryYear = arg.queryYear;
    var queryMonth = arg.queryMonth;
    var queryDate = getQueryDate(queryYear, queryMonth);
    var jdbc = new ( require('jdbc') );
    jdbc.initialize(global.hanaConfig, function(err, res) {
        jdbc.open(function(err, conn) {
            var sql = " SELECT \"GESCH\", \"GESCHT\",sum(\"COUNT_NUM\") AS \"COUNT_NUM\" "
                    + " FROM \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.onjob/CA_EMP_SEX_ONJOB_STAT\" "
                    + " ('PLACEHOLDER' = ('$$s_type$$', 'D'), 'PLACEHOLDER' = ('$$begda$$', ':startDate'), "
                    + "  'PLACEHOLDER' = ('$$endda$$', ':endDate'), 'PLACEHOLDER' = ('$$userid$$', ':userId')) "
                    + " WHERE 1 = 1 ";
            if(deptCodes != ""){
                sql += " AND \":deptCode\" in (:deptCodes) ";
            }
            sql += " GROUP BY \"GESCH\", \"GESCHT\" order by \"COUNT_NUM\" desc ";
            sql = sql.replace(":startDate",queryDate).replace(":endDate",queryDate).replace(":userId",userId)
                  .replace(":deptCode",deptCode).replace(":deptCodes",deptCodes);
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
function analyOnjobEducation(arg, Response) {
    var level = arg.level;
    var deptCode = "DEPT" + level;
    var deptName = "DEPTN" + level;
    var deptCodes = arg.deptCodes;
    var queryYear = arg.queryYear;
    var queryMonth = arg.queryMonth;
    var queryDate = getQueryDate(queryYear, queryMonth);
    var jdbc = new ( require('jdbc') );
    jdbc.initialize(global.hanaConfig, function(err, res) {
        jdbc.open(function(err, conn) {
            var sql = " SELECT \"SLART\",\"SLART_DES\",sum(\"COUNT_NUM\") AS \"COUNT_NUM\"  "
                    + " FROM  \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.onjob/CA_EMP_EDU_ONJOB_STAT\" "
                    + " ('PLACEHOLDER' = ('$$s_type$$', 'D'), 'PLACEHOLDER' = ('$$begda$$', ':startDate'), "
                    + "  'PLACEHOLDER' = ('$$endda$$', ':endDate'), 'PLACEHOLDER' = ('$$userid$$', ':userId')) "
                    + " WHERE 1 = 1 ";
            if(deptCodes != ""){
                sql += " AND \":deptCode\" in (:deptCodes) ";
            }
            sql += " GROUP BY \"SLART\",\"SLART_DES\" order by \"COUNT_NUM\" desc ";
            sql = sql.replace(":startDate",queryDate).replace(":endDate",queryDate).replace(":userId",userId)
                  .replace(":deptCode",deptCode).replace(":deptCodes",deptCodes);
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
function analyOnjobSiling(arg, Response) {
    var level = arg.level;
    var deptCode = "DEPT" + level;
    var deptName = "DEPTN" + level;
    var deptCodes = arg.deptCodes;
    var queryYear = arg.queryYear;
    var queryMonth = arg.queryMonth;
    var queryDate = getQueryDate(queryYear, queryMonth);
    var jdbc = new ( require('jdbc') );
    jdbc.initialize(global.hanaConfig, function(err, res) {
        jdbc.open(function(err, conn) {
            var sql = " SELECT \"SL_ID\", \"SL_NAME\",sum(\"COUNT_NUM\") AS \"COUNT_NUM\"  "
                    + " FROM  \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.onjob/CA_EMP_SL_ONJOB_STAT\" "
                    + " ('PLACEHOLDER' = ('$$s_type$$', 'D'), 'PLACEHOLDER' = ('$$begda$$', ':startDate'), "
                    + " 'PLACEHOLDER' = ('$$endda$$', ':endDate'), 'PLACEHOLDER' = ('$$userid$$', ':userId'))  "
                    + " WHERE 1 = 1 "
            if(deptCodes != ""){
                sql += " AND \":deptCode\" in (:deptCodes) ";
            }
            sql += " GROUP BY \"SL_ID\", \"SL_NAME\" order by \"COUNT_NUM\" desc ";
            sql = sql.replace(":startDate",queryDate).replace(":endDate",queryDate).replace(":userId",userId)
                  .replace(":deptCode",deptCode).replace(":deptCodes",deptCodes);
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
function analyOnjobAge(arg, Response) {
    var level = arg.level;
    var deptCode = "DEPT" + level;
    var deptName = "DEPTN" + level;
    var deptCodes = arg.deptCodes;
    var queryYear = arg.queryYear;
    var queryMonth = arg.queryMonth;
    var queryDate = getQueryDate(queryYear, queryMonth);
    var jdbc = new ( require('jdbc') );
    jdbc.initialize(global.hanaConfig, function(err, res) {
        jdbc.open(function(err, conn) {
            var sql = " SELECT \"AGE_ID\",\"AGE_NAME\",sum(\"COUNT_NUM\") AS \"COUNT_NUM\" "
                    + " FROM  \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.onjob/CA_EMP_AGE_ONJOB_STAT\"  "
                    + " ('PLACEHOLDER' = ('$$s_type$$', 'D'), 'PLACEHOLDER' = ('$$begda$$', ':startDate'), "
                    + " 'PLACEHOLDER' = ('$$endda$$', ':endDate'), 'PLACEHOLDER' = ('$$userid$$', ':userId')) "
                    + " WHERE 1 = 1 "
            if(deptCodes != ""){
                sql += " AND \":deptCode\" in (:deptCodes) ";
            }
            sql += " GROUP BY \"AGE_ID\",\"AGE_NAME\" ORDER BY \"COUNT_NUM\" desc ";
            sql = sql.replace(":startDate",queryDate).replace(":endDate",queryDate).replace(":userId",userId)
                  .replace(":deptCode",deptCode).replace(":deptCodes",deptCodes);
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
function analyOnjobTecAndDuty(arg, Response) {
    var level = arg.level;
    var deptCode = "DEPT" + level;
    var deptName = "DEPTN" + level;
    var deptCodes = arg.deptCodes;
    var queryYear = arg.queryYear;
    var queryMonth = arg.queryMonth;
    var queryDate = getQueryDate(queryYear, queryMonth);
    var jdbc = new ( require('jdbc') );
    jdbc.initialize(global.hanaConfig, function(err, res) {
        jdbc.open(function(err, conn) {
            var sql = " SELECT \"TYPESC\",\"TYPEST\",sum(\"COUNT_NUM\") AS \"COUNT_NUM\" "
                    + " FROM  \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.onjob/CA_EMP_POSITION_ONJOB_STAT\" "
                    + " ('PLACEHOLDER' = ('$$s_type$$', 'D'), 'PLACEHOLDER' = ('$$begda$$', ':startDate'), "
                    + " 'PLACEHOLDER' = ('$$endda$$', ':endDate'), 'PLACEHOLDER' = ('$$userid$$', ':userId')) "
                    + " WHERE 1 = 1 ";
            if(deptCodes != ""){
                sql += " AND \":deptCode\" in (:deptCodes) ";
            }
            sql += " GROUP BY \"TYPESC\",\"TYPEST\" ORDER BY \"COUNT_NUM\" desc ";
            sql = sql.replace(":startDate",queryDate).replace(":endDate",queryDate).replace(":userId",userId)
                  .replace(":deptCode",deptCode).replace(":deptCodes",deptCodes);
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

/**
 *将请求参数进行hash编码，作为redis的缓存key
*/
function transformData2Hash(arg){
	var year = arg.queryYear;
	var month = arg.queryMonth;
	var level = arg.level;
	var deptCodes = arg.deptCodes;
	var op = arg.op;
	var content = year + month + level + deptCodes + op;
	var shasum = crypto.createHash('sha1');
	shasum.update(content);
	var d = shasum.digest('hex');
	return d;
}

exports.Runner = run;

