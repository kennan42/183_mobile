var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var baseSchema = require("./BaseSchema.js");
var appSchema = require("../app/AppSchema.js");
var template = require("art-template");

var util = {
    //查询元素在数据里的索引，如果不存在，择返回-1
    inArray : function(e, arr) {
        if (e == null || arr == null) {
            return -1;
        }
        for (var i in arr) {
            if (arr[i] == e) {
                return i;
            }
        }
        return -1;
    },
    //删除第一个数组中的元素e
    removeElementFromArray : function(e, arr) {
        var index = this.inArray(e, arr);
        if (index != -1) {
            arr.splice(index, 1);
        }
    },
    //删除数组中出现的所有元素e
    removeAllElementFromArray : function(e, arr) {
        var index = -1;
        while (true) {
            index = this.inArray(e, arr);
            if (index != -1) {
                arr.splice(index, 1);
                removeAllElementFromArray(e, arr);
            } else {
                return arr;
            }
        }
    },
    //判断一个数组的元素是否全在另一个数组里 arr1小数组 arr2大数组,只适用于简单对象
    containArray : function(arr1, arr2) {
        var num = 0;
        if (arr1 == null || arr2 == null) {
            return false;
        }
        if (arr1.length > arr2.length) {
            return false;
        }
        for (var i in arr1) {
            for (var j in arr2) {
                if (arr1[i] == arr2[j]) {
                    num++;
                }
            }
        }
        if (num == arr1.length) {
            return true;
        } else {
            return false;
        }
    },
    /**
     根据时间戳获取格式化的日期字符串
     times:时间戳
     showTime:true返回时间
     */
    getDateStrFromTimes : function(times, showTime) {
        var date = new Date();
        date.setTime(times);
        var year = date.getFullYear();
        var month = date.getMonth();
        month += 1;
        if (month < 10) {
            month = '0' + month;
        }
        var date1 = date.getDate();
        if (date1 < 10) {
            date1 = '0' + date1;
        }
        if (!showTime) {
            return year + '-' + month + '-' + date1;
        } else {
            var hours = date.getHours();
            if (hours < 10) {
                hours = '0' + hours;
            }
            var minutes = date.getMinutes();
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            var seconds = date.getSeconds();
            if (seconds < 10) {
                seconds = '0' + seconds;
            }
            return year + '-' + month + '-' + date1 + ' ' + hours + ':' + minutes + ":" + seconds;
        }
    },
    //根据date获取格式化的日期字符串
    getDateStrFromDate : function(date, showTime) {
        var times = date.getTime();
        return getDateStrFromTimes(times, showTime);
    },
    getDateStrFromTimes2 : function(times, showHour, showMinute, showSecond) {
        var rs = "";
        var date = new Date();
        date.setTime(times);
        var year = date.getFullYear();
        var month = date.getMonth();
        month += 1;
        if (month < 10) {
            month = '0' + month;
        }
        var date1 = date.getDate();
        if (date1 < 10) {
            date1 = '0' + date1;
        }
        rs = year + "-" + month + "-" + date1;
        if (showHour) {
            var hour = date.getHours() + 100 + '';
            rs += ' ' + hour.substr(1, 2);
        }
        if (showHour && showMinute) {
            var minute = date.getMinutes() + 100 + '';
            rs += ':' + minute.substr(1, 2);
        }
        if (showHour && showMinute && showSecond) {
            var second = date.getSeconds() + 100 + '';
            rs += ':' + second.substr(1, 2);
        }
        return rs;

    },
    //根据时间戳得到时间格式MM-dd HH:mm
    getMMddHHmmFromTimes : function(times) {
        var date = new Date();
        date.setTime(times);
        var month = date.getMonth() + 1 + "";
        var curDate = date.getDate() + "";
        var hour = date.getHours() + 100 + "";
        var minute = date.getMinutes() + 100 + "";
        return month + "月" + curDate + "日 " + hour.substr(-2) + ":" + minute.substr(-2);

    },
    /**
     *得到2个时间戳间隔的小时数，每天以8小时计算
     *@param startTime
     *@param endTime
     *@return int
     */
    getIntervalHoursFromTimes : function(startTime, endTime) {
        var date1 = new Date();
        date1.setTime(startTime);
        date1.setHours(0);
        date1.setMinutes(0);
        date1.setSeconds(0);
        date1.setMilliseconds(0);

        var date2 = new Date();
        date2.setTime(endTime);
        date2.setHours(0);
        date2.setMinutes(0);
        date2.setSeconds(0);
        date2.setMilliseconds(0);

        var intervalTimes = Math.abs(date1.getTime() - date2.getTime());
        var everydayTimes = 24 * 60 * 60 * 1000;

        return (intervalTimes / everydayTimes + 1) * 8;
    },
    /**
     *根据时间戳获取某天的最大或最小时间
     *@param times 时间戳
     *@flag -1最小  1最大
     *@return  long
     */
    getLimitTimesOfDay : function(times, flag) {
        var rs = null;
        var date = new Date();
        date.setTime(times);
        if (flag == 1) {//max times
            date.setHours(23);
            date.setMinutes(59);
            date.setSeconds(59);
            date.setMilliseconds(999);
            rs = date.getTime();
        } else if (flag == -1) {//min times
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            rs = date.getTime();
        } else {// orginal times
            rs = times;
        }
        return rs;
    },
    pushMsg : function(arg) {
        var pushQueue = async.queue(function(task, callback) {
            setTimeout(function() {
                var userId = task.userId;
                var module = arg.module;
                var regExp = new RegExp(userId);
                var conn = mongoose.createConnection(global.mongodbURL);
                var appUserMessageModuleModel = conn.model("app_user_message_module", appSchema.appUserMessageModuleSchema);
                var appUserMsgPushStatusModel = conn.model("app_user_msgpush_status", appSchema.appUserMsgPushStatusSchema);
                var pushMsg = true;
                async.series([
                //查询当前消息推送开关
                function(cb) {
					var module = arg.module;
					appUserMessageModuleModel.findOne({"userId":regExp,"status":0,"moduleCode":module},function(err,data){
						if(data != null){
							pushMsg = false;
						}
						cb(err,data);
					});
                },
                //查询消息推送总开关
                function(cb) {
					appUserMsgPushStatusModel.findOne({"userId":regExp,"status":0},function(err,data){
						if(data != null){
							pushMsg = false;
						}
						cb(err,data);
					});
                }], function(err, data) {
                    conn.close();
                    if (pushMsg) {//进行消息推送
                        var pushArg = {};
                        var num = 0;
                        async.parallel([
                        //根据userId查询softToken
                        function(cb) {
                            var sql = " SELECT deviceToken,softToken,pushType from BindUser " + " where userId = '" + userId + "' ORDER BY createdAt desc limit 0,1";
                            var option = {
                                CN : "Dsn=mysql-emm",
                                sql : sql
                            };
                            MEAP.ODBC.Runner(option, function(err, rows, cols) {
                                if (!err && rows != null && rows.length > 0) {
                                    var softToken = rows[0].softToken;
                                    var deviceToken = rows[0].deviceToken;
                                    var pushType = rows[0].pushType;
                                    if (pushType != null && pushType == "mqtt") {
                                        pushArg.platforms = "1";
                                        pushArg.softToken = softToken;
                                    } else {
                                        pushArg.platforms = "0";
                                        pushArg.softToken = deviceToken;
                                    }
                                    pushArg.appId = arg.appId;
                                    pushArg.title = arg.title;
                                    pushArg.body = "";
                                    if (arg.body) {
                                        pushArg.body = arg.body;
                                    }
                                    pushArg.module = arg.module;
                                    pushArg.subModule = arg.subModule;
                                    cb(null, "0");
                                    //进行推送
                                } else {
                                    cb(null, "-1");
                                    //无法推送
                                }
                            });
                        },
                        function(cb) {
                            var paramJSon = {
                                "IS_PUBLIC" : {
                                    "FLOWNO" : "",
                                    "PERNR" : "",
                                    "ZDOMAIN" : "400"
                                },
                                "P_SP_PERNR" : userId,
                                "P_SP_STATUS" : 0
                            };
                            var option = {
                                agent : false,
                                method : "POST",
                                url : global.baseURL + "/zhrws/ZHRWS_GET_OT_CO_LINES",
                                Body : paramJSon
                            };

                            MEAP.AJAX.Runner(option, function(err, res, data) {
                                if (!err) {
                                    data = JSON.parse(data);
                                    var num1 = data.E_2005;
                                    var num2 = data.E_2011;
                                    cb(err, parseInt(num1) + parseInt(num2));
                                } else {
                                    cb(err, 0);
                                }

                            });

                        },
                        function(cb) {
                            var paramJSon = {
                                "input" : {
                                    "channelSerialNo" : new Date().getTime(), //序列号
                                    "currUsrId" : userId, //员工号
                                    "domain" : "400",
                                    "extendMap" : {
                                        "entry" : [{
                                            "Key" : "",
                                            "Value" : ""
                                        }]
                                    },
                                    "qryType" : "4",
                                    "userId" : userId,
                                    "lastTime" : "", //获取当天日期
                                    "bussType" : "2001", //代表休假待审列表
                                    "startPage" : 1,
                                    "pageSize" : 1000
                                }
                            };

                            var option = {
                                agent : false,
                                method : "POST",
                                url : global.baseURL + "/portal/PORTAL_BPMI_TaskListQry",
                                Body : paramJSon
                            };
                            MEAP.AJAX.Runner(option, function(err, res, data) {
                                if (!err) {
                                    data = JSON.parse(data);
                                    if (data != null && data.output != null && data.output.type == "S") {
                                        cb(err, parseInt(data.output.totalCount));
                                    } else {
                                        cb(err, 0);
                                    }
                                } else {
                                    cb(err, 0);
                                }
                            });

                        },
                        //查询会议室的带审批的数量
                        function(cb) {
                            var option = {
                                agent : false,
                                url : global.baseURL + "/meet/examine",
                                method : "post",
                                Body : {
                                    "state" : "0",
                                    "pageNumber" : 1,
                                    "pageSize" : 1,
                                    "userId" : userId
                                }
                            };
                            MEAP.AJAX.Runner(option, function(err, res, data) {
                                if (!err) {
                                    var data = JSON.parse(data);
                                    cb(null, data.count);
                                } else {
                                    cb(null, 0);
                                }
                            });
                        },
                        //查看文档平台的代办的数量
                        function(cb) {
                            var option = {
                                agent : false,
                                url : global.baseURL + "/docPlatform/PORTALBPMIWaitTaskNumImplBean",
                                method : "post",
                                Body : {
                                    "input" : {
                                        "channelSerialNo" : new Date().getTime(), // 时间戳 + 123456789
                                        "currUsrId" : userId,
                                        "domain" : 400,
                                        "reqUsrId" : userId
                                    }
                                }
                            };
                            MEAP.AJAX.Runner(option, function(err, res, data) {
                                if (!err) {
                                    data = JSON.parse(data);
                                    var num1 = parseInt(data.output.fmsSaveWTNum) + parseInt(data.output.fmsReadWTNum) + parseInt(data.output.fmsDestWTNum);
                                    cb(null, num1);
                                } else {
                                    cb(null, 0);
                                }
                            });
                        }], function(err, data) {
                            var data0 = data[0];
                            if (data0 != "-1") {//推送
                                num = data[1] + data[2] + data[3] + data[4];
                                pushArg.badgeNum = num;
                                pushArg.userCodeListStr = userId;
                                if (pushArg.title.length > 40) {
                                    var subTitle = pushArg.title.substr(0, 40) + "...";
                                    pushArg.title = subTitle;
                                }
                                var option = {
                                    agent : false,
                                    method : "POST",
                                    url : global.pushURL,
                                    Body : pushArg,
                                    Enctype : "application/x-www-form-urlencoded"
                                };
                                MEAP.AJAX.Runner(option, function(err, res, data) {
                                    console.log("push result--->", data);
                                    var pushResult = JSON.parse(data);
                                    if (pushResult != null && pushResult.status != null && pushResult.status == "ok") {
                                        savePushMsgLog(pushArg);
                                        console.log(userId + " push over");
                                    }
                                    callback(null, "");
                                }, null);
                            } else {
                                console.log("no user to push msg");
                                callback(null, "");
                            }
                        });
                    } else {
                        console.log(userId + " not push msg with module " + arg.module);
                        callback(null, "");
                    }
                });
            }, 10000);
        }, 100);
        var userIds = arg.userIds;
        for (var i in userIds) {
            pushQueue.push({
                "userId" : userIds[i]
            });
        }
        pushQueue.drain = function() {
            console.log("push over");
        }
    },
    broadcastMsg : function(arg) {
        var title = arg.title;
        if (title.length > 40) {
            var subTitle = title.substr(0, 40) + "...";
            arg.title = subTitle;
        }
        var option = {
            agent : false,
            method : "POST",
            url : global.pushURL,
            Body : arg,
            Enctype : "application/x-www-form-urlencoded"
        };
        MEAP.AJAX.Runner(option, function(err, res, data) {
            console.log("push result--->", data);
        }, null);
    },
    /*Javascript设置要保留的小数位数，四舍五入。
     *ForDight(Dight,How):数值格式化函数，Dight要格式化的 数字，How要保留的小数位数。
     *这里的方法是先乘以10的倍数，然后去掉小数，最后再除以10的倍数。
     */
    forDight : function(Dight, How) {
        Dight = Math.round(Dight * Math.pow(10, How)) / Math.pow(10, How);
        return Dight;
    },
    sendRTXMsg : function(arg) {
        var rtxId = null;
        async.series([
        //根据用户id查询RTX账号
        function(cb) {
            var option = {
                agent : false,
                method : "POST",
                url : global.baseURL + "/zhrws/zhrwsmss11",
                Body : {
                    "P_DATE" : "",
                    "P_PERNR" : {
                        "item" : [{
                            "PERNR" : arg.userId
                        }]
                    }
                }
            };
            MEAP.AJAX.Runner(option, function(err, res, data) {
                if (!err) {
                    data = JSON.parse(data);
                    if (data.BASE_INFO.item != null && data.BASE_INFO.item.length > 0) {
                        rtxId = data.BASE_INFO.item[0].RTX;
                        cb(null, "");
                    } else {
                        console.log("没有查询到RTX账号信息");
                    }
                }
            });
        },
        //RTX推送
        function(cb) {
            var msg = {
                "tns:strReceiver" : rtxId,
                "tns:MESSAGE_ID" : new Date().getTime(),
                "tns:bstrMsg" : arg.title
            };
            var wsdl = "http://192.168.2.28:8234/SendNotifyWebService.asmx?wsdl";
            if (global.wsdl == "wsdl_pro") {
                wsdl = "http://172.16.0.2:8234/SendNotifyWebService.asmx?wsdl";
            }
            var option = {
                wsdl : wsdl,
                func : "SendNotifyWebService.SendNotifyWebServiceSoap.SendNotify",
                Params : msg
            };

            MEAP.SOAP.Runner(option, function(err, res, data) {
            });
        }]);
    },
    hashEncode : function(content) {
        var crypto = require('crypto');
        var shasum = crypto.createHash('sha1');
        shasum.update(content);
        var d = shasum.digest('hex');
        return d;
    },
    isEmptyObject: function (obj) {
        for (var n in obj) {
            return false
        }
        return true;
    },
    
    makeSql: function(str,data){
        var render = template.compile(str);
        var sql = render(data);
        return sql;
    }
};

//保存推送消息记录
function savePushMsgLog(arg) {
    var db = mongoose.createConnection(global.mongodbURL);
    var basePushMessageLogModel = db.model("basePushMessageLog", baseSchema.BasePushMessageLogSchema);
    var basePushMessageLogEntity = new basePushMessageLogModel({
        appId : arg.appId,
        userId : arg.userCodeListStr,
        title : arg.title,
        body : arg.body,
        pushTime : new Date().getTime(),
        readStatus : 0,
        module : arg.module,
        subModule : arg.subModule
    });
    basePushMessageLogEntity.save(function(err) {
        db.close();
    });
}

exports.inArray = util.inArray;
exports.removeElementFromArray = util.removeElementFromArray;
exports.removeAllElementFromArray = util.removeAllElementFromArray;
exports.getDateStrFromTimes = util.getDateStrFromTimes;
exports.getDateStrFromTimes2 = util.getDateStrFromTimes2;
exports.getDateStrFromDate = util.getDateStrFromDate;
exports.pushMsg = util.pushMsg;
exports.broadcastMsg = util.broadcastMsg;
exports.getMMddHHmmFromTimes = util.getMMddHHmmFromTimes;
exports.getIntervalHoursFromTimes = util.getIntervalHoursFromTimes;
exports.getLimitTimesOfDay = util.getLimitTimesOfDay;
exports.forDight = util.forDight;
exports.sendRTXMsg = util.sendRTXMsg;
exports.hashEncode = util.hashEncode;
exports.isEmptyObject = util.isEmptyObject;
exports.makeSql = util.makeSql;
