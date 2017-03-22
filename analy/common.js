var util = require("../base/util.js");
//hash编码
function decode2Hash(str) {
    var crypto = require('crypto');
    var shasum = crypto.createHash('sha1');
    shasum.update(str);
    var d = shasum.digest('hex');
    return d;
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

function handleResult(rs) {
    var arr = [];
    for (var i in rs) {
        var item = rs[i];
        for (var j in item) {
            if (j.toUpperCase().indexOf("SUM") != -1) {
                item.count = item[j];
                delete item[j];
            }
        }
        arr.push(item);
    }
    return arr;
}

function handleResultDimission(rs) {
    var arr = [];
    for (var i in rs) {
        var item = rs[i];
        for (var j in item) {
            if (j.toUpperCase().indexOf("LZ_NUM") != -1) {
                item.LZ_NUM = item[j];
                delete item[j];
            }
            if (j.toUpperCase().indexOf("ZZ_NUM") != -1) {
                item.ZZ_NUM = item[j];
                delete item[j];
            }
            if (j.toUpperCase().indexOf("RATIO") != -1) {
                item.RATIO = item[j];
                delete item[j];
            }
        }
        arr.push(item);
    }
    return arr;
}

//function handleMoveResult(rows) {
//    var arr = [];
//    for (var i in rows) {
//        var item = rows[i];
//        for (var j in item) {
//            if (j.toUpperCase().indexOf("LIZHI_NUM") != -1) {
//                item.LIZHI_NUM = item[j];
//                delete item[j];
//            }
//            if (j.toUpperCase().indexOf("DIAOCHU_NUM") != -1) {
//                item.DIAOCHU_NUM = item[j];
//                delete item[j];
//            }
//            if (j.toUpperCase().indexOf("ZAIZHI_NUM") != -1) {
//                item.ZAIZHI_NUM = item[j];
//                delete item[j];
//            }
//            if (j.toUpperCase().indexOf("RUZHI_NUM") != -1) {
//                item.RUZHI_NUM = item[j];
//                delete item[j];
//            }
//            if (j.toUpperCase().indexOf("DIAORU_NUM") != -1) {
//                item.DIAORU_NUM = item[j];
//                delete item[j];
//            }
//        }
//        arr.push(item);
//    }
//    return arr;
//}


/**
 * 将查询到的数据中的指定key转换成指定的key
 * @param rows
 * @param keys [{oldKey:"xxxx",newKey:"xxx"},..]
 * @returns {Array}
 */
function handleMoveResult(rows, keys) {
    var result = [];
    for (var i in rows) {
        var item = rows[i];
        for (var j in item) {
            for (var k in keys) {
                if (j == "" && j == keys[k].oldKey) {
                    //console.info(1,j,keys[k].oldKey,item[j]);
                    item[keys[k].newKey] = item[j];
                    delete item[j];
                    break;
                }
                if (j != "" && keys[k].oldKey != "" && j.toUpperCase().indexOf(keys[k].oldKey.toUpperCase()) != -1) {
                    //console.info(2,j,keys[k].oldKey,item[j]);
                    item[keys[k].newKey] = item[j];
                    delete item[j];
                    break;
                }
            }
        }
        result.push(item);
    }
    return result;
}

/**
 * 获取数据
 * 获取的顺序为 Redis缓存->HANA
 *
 * @param content
 * @param sql
 * @param Response
 * @param keys [{oldKey:"xxx",newKey:"xxx"},...] 由于 JDBC 的版本问题 AS 参数不起作用，需要将返回的字段进行替换
 */
function getHANAData(content, sql, Response, keys, arg, type, module) {
    var async = require("async");
    var REDIS = require("meap_redis");
    var rs = null;
    console.info(sql);
    async.series([
        function (cb) {
            var redisCli = REDIS.createClient(global.redisPort, global.redisHost);
            redisCli.on("ready", function () {
                redisCli.select(10, function () {
                    redisCli.get(content, function (err, data) {
                        redisCli.quit();
                        if (data != null) {
                            console.log("result from redis");
                            data = JSON.parse(data);
                            Response.end(JSON.stringify({
                                "status": "0",
                                "data": data
                            }));
                        } else {
                            cb(null, "");
                        }
                    });
                });
            });
        }, function (cb) {
            var jdbc = new ( require('jdbc') );
            var HANAVisitLog = {};
            HANAVisitLog.type = type;
            HANAVisitLog.module = module;
            HANAVisitLog.params = JSON.stringify(arg);
            HANAVisitLog.HANAInit = new Date().getTime();
            console.info(new Date().getTime() + "\tHANA连接初始化");
            jdbc.initialize(global.hanaConfig, function (err, res) {
                if (err != null) {
                    errorLog(Response, err, "JDBC INIT ERROR！");
                    return;
                }
                HANAVisitLog.HANAOpen = new Date().getTime();
                console.info(new Date().getTime() + "\tHANA初始化完毕，打开连接");
                jdbc.open(function (err, conn) {
                    if (err != null) {
                        errorLog(Response, err, "JDBC OPEN ERROR！");
                        return;
                    }
                    HANAVisitLog.HANATimeQueryBegin = new Date().getTime();
                    console.info(new Date().getTime() + "\t连接打开完毕，开始执行SQL");
                    jdbc.executeQuery(sql, function (err, rows) {
                        if (err != null) {
                            errorLog(Response, err, "JDBC EXECUTE ERROR！");
                            return;
                        }
                        HANAVisitLog.HANATimeQueryEnd = new Date().getTime();
                        console.info(new Date().getTime() + "\tSQL 执行完毕，开始处理数据");
                        jdbc.close(function (err) {
                            if (err != null) {
                                errorLog(Response, err, "JDBC CLOSE ERROR！");
                                return;
                            }
                        });
                        rs = handleMoveResult(rows, keys);
                        console.info(new Date().getTime() + "\t数据处理完毕");
                        Response.end(JSON.stringify({
                            "status": "0",
                            "data": rs
                        }));

                        saveHANAVisitLog(HANAVisitLog);

                        cb(null, "");
                    });
                });
            });
        }, function (cb) {
            var redisCli = REDIS.createClient(global.redisPort, global.redisHost);
            redisCli.on("ready", function () {
                redisCli.select(10, function () {
                    redisCli.SETEX(content, ttl, JSON.stringify(rs), function (err) {
                        console.log("save result to redis");
                        redisCli.quit();
                        cb(null, "");
                    });
                });
            });
        }], function (err, data) {
        console.log("analy over");
    });
}

/**
 * 出错室打出日志
 * @param Response
 * @param err
 * @param msg
 */
function errorLog(Response, err, msg) {
    console.info(msg, err);
    Response.end(JSON.stringify({
        "status": "1",
        "data": []
    }));
}

/**
 * 报错数据到 HANA
 * @param obj
 */
function saveHANAVisitLog(obj) {
    obj.HANAQueryTime = obj.HANATimeQueryEnd - obj.HANATimeQueryBegin;
    obj.createTime = new Date().getTime();

    var HANAVisitLogSchema = require("./HANAVisitLogSchema.js");
    var mongoose = require("mongoose");
    var conn = mongoose.createConnection(global.mongodbURL);
    var HANAVisitLogModel = conn.model("hanaVisitLog", HANAVisitLogSchema.HANAVisitLogSchema);
    var HANAVisitLog = new HANAVisitLogModel(obj);
    HANAVisitLog.save(function (err, data) {
        conn.close();
    });
}

/**
 * 在以,分割的字符串中增加单引号
 * @param str xxxx,xxxx,xxxx,.....,xxxx
 * @returns {string} 'xxxx','xxxx',....,'xxxx'
 */
function addSingleQuotationMarks(str) {
    if(str == '' || str == null) {
        return '';
    }
    var res = "";
    var strArr = str.split(',');
    for(var i = 0; i < strArr.length - 1;i++) {
        res += "'"+ strArr[i] +"',";
    }
    if(strArr.length > 0) {
        res += "'"+ strArr[strArr.length - 1] +"'";
    }
    return res;
}

//四舍五入
function forDight(Dight,How){  
    Dight = Math.round(Dight*Math.pow(10,How))/Math.pow(10,How);  
    return Dight;  
 }
 
//根据时间戳得到一周的开始时间
function getWeekStartTime(date){
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    
    var day = date.getDay();
    var intervalDay = null;
    switch(day){
        case 1:
        intervalDay = 0;
        break;
        case 2:
        intervalDay = 1;
        break;
        case 3:
        intervalDay = 2;
        break;
        case 4:
        intervalDay = 3;
        break;
        case 5:
        intervalDay = 4;
        break;
        case 6:
        intervalDay = 5;
        break;
        case 0:
        intervalDay = 6;
        break;
    }
    var intervalTimes = intervalDay*86400*1000;
    var startTimes = date.getTime() - intervalTimes;
    date.setTime(startTimes);
    return date;
}

//根据时间戳得到一周的结束时间
function getWeekEndTime(date){
    date.setHours(23);
    date.setMinutes(59);
    date.setSeconds(59);
    date.setMilliseconds(999);
    
    var day = date.getDay();
    var intervalDay = null;
    switch(day){
        case 1:
        intervalDay = 6;
        break;
        case 2:
        intervalDay = 5;
        break;
        case 3:
        intervalDay = 4;
        break;
        case 4:
        intervalDay = 3;
        break;
        case 5:
        intervalDay = 2;
        break;
        case 6:
        intervalDay = 1;
        break;
        case 0:
        intervalDay = 0;
        break;
    }
    var intervalTimes = intervalDay*86400*1000;
    var endTimes = date.getTime() + intervalTimes;
    console.log("getWeekEndTime",endTimes);
    date.setTime(endTimes);
    return date;
}

//得到某月的开始时间
function getMonthStartTime(date){
    date.setDate(1);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
}


//得到某月的结束时间
function getMonthEndTime(date){
    var month = date.getMonth();
    date.setHours(23);
    date.setMinutes(59);
    date.setSeconds(59);
    date.setMilliseconds(999);
    if(month == 0 || month == 2 || month == 4 || month == 6 || month == 7 || month == 9 || month == 11){
        date.setDate(31);
    }else if(month == 3 || month == 5 || month == 8 || month == 10){
        date.setDate(30);
    }else{
        var year = date.getFullYear();
        if((year % 4 == 0) && (year % 100 != 0) || (year % 400 == 0)){
            date.setDate(29);
        }else{
            date.setDate(28);
        }
    }
    return date;
}

//得到一天的开始时间
function getDateStartTime(date){
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
}

//得到一天的结束时间
function getDateEndTime(date){
    date.setHours(23);
    date.setMinutes(59);
    date.setSeconds(59);
    date.setMilliseconds(999);
    return date;
}

/**
 *时间格式化
 *x date
 *y format
*/
function date2str(x, y) {
   var z = {
      y: x.getFullYear(),
      M: x.getMonth() + 1,
      d: x.getDate(),
      h: x.getHours(),
      m: x.getMinutes(),
      s: x.getSeconds()
   };
   return y.replace(/(y+|M+|d+|h+|m+|s+)/g, function(v) {
      return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-(v.length > 2 ? v.length : 2))
   });
}

//缓存时间
var ttl = 180;

exports.decode2Hash = decode2Hash;
exports.getCurrentDate = getCurrentDate;
exports.inArray = inArray;
exports.getQueryDate = getQueryDate;
exports.handleResult = handleResult;
exports.ttl = ttl;
exports.handleResultDimission = handleResultDimission;
exports.getHANAData = getHANAData;
exports.addSingleQuotationMarks = addSingleQuotationMarks;
exports.forDight = forDight;
exports.getWeekStartTime = getWeekStartTime;
exports.getWeekEndTime = getWeekEndTime;
exports.getMonthStartTime = getMonthStartTime;
exports.getMonthEndTime = getMonthEndTime;
exports.getDateStartTime = getDateStartTime;
exports.getDateEndTime = getDateEndTime;
exports.date2str = date2str;