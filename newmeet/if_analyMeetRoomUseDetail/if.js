var MEAP = require("meap");
var mongoose = require("mongoose");
var sm = require("../meetSchema.js");
var async = require("async");
var util = require("../../base/util.js");

/**
 * 统计会议室接口使用情况
 * @author donghua.wang
 * @date 2015年06月11日 13:12
 * */
function run(Param, Robot, Request, Response, IF) {
    var arg = Param.params;
    Response.setHeader("Content-Type", "text/json;charset=utf-8");
    var username = arg.username;
    var password = arg.password;
    if (username != "admin" || password != "admin") {
        Response.end(JSON.stringify({
            "status" : "0",
            "msg" : "非法访问"
        }));
        return;
    }
    main(arg, Response);
}

function main(arg, Response) {
    var startTime = parseInt(arg.startTime);
    var endTime = parseInt(arg.endTime);
    var db = mongoose.createConnection(global.mongodbURL);
    var meetInvokeLogModel = db.model("meetInvokeLog", sm.MeetInvokeLogSchema);
    var meetBookModel = db.model("meetBook", sm.MeetBookSchema);
    var meetRoomModel = db.model("meetRoom", sm.MeetRoomSchema);
    async.parallel([
    //指定时间段内使用手机查询会议室详情的次数
    function(cb) {
        meetInvokeLogModel.count({
            "invokeType" : "app",
            "func" : "queryMeetRoom",
            "createTime" : {
                "$gte" : startTime,
                "$lte" : endTime
            }
        }, function(err, count) {
            cb(err, {
                "使用手机查询会议室详情次数" : count
            });
        })
    },
    //指定时间段内使用手机提交预定会议室的次数(按照厂区统计/合计)
    function(cb) {
        meetInvokeLogModel.aggregate([{
            "$match" : {
                "invokeType" : "app",
                "func" : "bookMeetRoom",
                "createTime" : {
                    "$gte" : startTime,
                    "$lte" : endTime
                }
            }
        }, {
            "$group" : {
                "_id" : "$guishudiName",
                "count" : {
                    "$sum" : 1
                }
            }
        }, {
            "$sort" : {
                count : -1
            }
        }], function(err, data) {
            var arr = [];
            var num = 0;
            for (var i in data) {
                num += data[i].count;
                arr.push({
                    "归属地" : data[i]._id,
                    "预定次数" : data[i].count
                });
            }
            cb(err, {
                "手机预定会议室统计" : arr,
                "合计" : num
            });
        });
    },
    //指定时间段内使用网页查询会议室详情的次数
    function(cb) {
        meetInvokeLogModel.count({
            "invokeType" : "pc",
            "func" : "queryMeetRoom",
            "createTime" : {
                "$gte" : startTime,
                "$lte" : endTime
            }
        }, function(err, count) {
            cb(err, {
                "使用网页查询会议室详情次数" : count
            });
        })
    },
    //指定时间段内使用网页提交预定会议室的次数(按照厂区统计/合计)
    function(cb) {
        meetInvokeLogModel.aggregate([{
            "$match" : {
                "invokeType" : "pc",
                "func" : "bookMeetRoom",
                "createTime" : {
                    "$gte" : startTime,
                    "$lte" : endTime
                }
            }
        }, {
            "$group" : {
                "_id" : "$guishudiName",
                "count" : {
                    "$sum" : 1
                }
            }
        }, {
            "$sort" : {
                count : -1
            }
        }], function(err, data) {
            var arr = [];
            var num = 0;
            for (var i in data) {
                num += data[i].count;
                arr.push({
                    "归属地" : data[i]._id,
                    "预定次数" : data[i].count
                });
            }
            cb(err, {
                "网页预定会议室统计" : arr,
                "合计" : num
            });
        });
    },
    //统计系统内会议室管理员数量（每个厂区分别统计合计）
    function(cb) {
        var meetRoomModel = db.model("meetRoom", sm.MeetRoomSchema);
        async.parallel([
        //统计徐庄厂区会议室管理员数量
        function(cb) {
            meetRoomModel.distinct("admin.userId", {
                "guishudiName" : "徐庄园区"
            }, function(err, data) {
                cb(err, {
                    "厂区" : "徐庄园区",
                    "count" : data.length
                });
            });
        },
        //统计海州厂区会议室管理员数量
        function(cb) {
            meetRoomModel.distinct("admin.userId", {
                "guishudiName" : "海州厂区"
            }, function(err, data) {
                cb(err, {
                    "厂区" : "海州厂区",
                    "count" : data.length
                });
            });
        },
        //统计新浦厂区会议室管理员数量
        function(cb) {
            meetRoomModel.distinct("admin.userId", {
                "guishudiName" : "新浦厂区"
            }, function(err, data) {
                cb(err, {
                    "厂区" : "新浦厂区",
                    "count" : data.length
                });
            });
        },
        //统计润众厂区会议室管理员数量
        function(cb) {
            meetRoomModel.distinct("admin.userId", {
                "guishudiName" : "润众厂区"
            }, function(err, data) {
                cb(err, {
                    "厂区" : "润众厂区",
                    "count" : data.length
                });
            });
        }], function(err, data) {
            meetRoomModel.distinct("admin.userId", function(err, data1) {
                cb(err, {
                    "各厂区统计管理员统计" : data,
                    "合计" : data1.length
                });
            });
        });
    },
    //统计系统内会议室数量(按照厂区统计/合计)
    function(cb) {
        meetRoomModel.aggregate([{
            "$match" : {
                "state" : {
                    "$in" : [1, 2, 4]
                }
            }
        }, {
            "$group" : {
                "_id" : "$guishudiName",
                "total" : {
                    "$sum" : 1
                }
            }
        }, {
            "$sort" : {
                "total" : -1
            }
        }], function(err, data) {
            var arr = [];
            var num = 0;
            for (var i in data) {
                num += data[i].total;
                arr.push({
                    "归属地" : data[i]._id,
                    "数量" : data[i].total
                });
            }
            cb(err, {
                "会议室总量统计" : arr,
                "合计" : num
            });
        });
    },
    //指定时间段内成功使用会议室预定人员排名前10名
    function(cb) {
        meetBookModel.aggregate([{
            "$match" : {
                "createTime" : {
                    "$gte" : startTime,
                    "$lte" : endTime
                }
            }
        }, {
            "$group" : {
                "_id" : "$userId",
                "total" : {
                    "$sum" : 1
                }
            }
        }, {
            "$sort" : {
                total : -1
            }
        }, {
            "$limit" : 10
        }], function(err, data) {
            var arr = [];
            for (var i in data) {
                arr.push({
                    "员工id" : data[i]._id,
                    "预定次数" : data[i].total
                });
            }
            cb(err, {
                "预定会议室排名统计" : arr
            });
        });
    },
    //指定时间段内普通会议室预定的次数（每个厂区分别统计合计）
    function(cb) {
        meetInvokeLogModel.aggregate([{
            "$match" : {
                "meetRoomType" : 1,
                "createTime" : {
                    "$gte" : startTime,
                    "$lte" : endTime
                }
            }
        }, {
            "$group" : {
                "_id" : "$guishudiName",
                "total" : {
                    "$sum" : 1
                }
            }
        }], function(err, data) {
            var arr = [];
            var num = 0;
            for (var i in data) {
                num += data[i].total;
                arr.push({
                    "归属地" : data[i]._id,
                    "数量" : data[i].total
                });
            }
            cb(err, {
                "普通会议室预定统计" : arr,
                "合计" : num
            });
        });
    },
    //指定时间段内需要管理员审批会议室预定的次数（每个厂区分别统计合计）
    function(cb) {
        meetInvokeLogModel.aggregate([{
            "$match" : {
                "needApply" : 1,
                "createTime" : {
                    "$gte" : startTime,
                    "$lte" : endTime
                }
            }
        }, {
            "$group" : {
                "_id" : "$guishudiName",
                "total" : {
                    "$sum" : 1
                }
            }
        }], function(err, data) {
            var arr = [];
            var num = 0;
            for (var i in data) {
                num += data[i].total;
                arr.push({
                    "归属地" : data[i]._id,
                    "数量" : data[i].total
                });
            }
            cb(err, {
                "需要审批会议室预定统计" : arr,
                "合计" : num
            });
        });
    },
    //指定时间段内视频会议室预定的次数（每个厂区分别统计合计）
    function(cb) {
        meetInvokeLogModel.aggregate([{
            "$match" : {
                "meetRoomType" : 2,
                "createTime" : {
                    "$gte" : startTime,
                    "$lte" : endTime
                }
            }
        }, {
            "$group" : {
                "_id" : "$guishudiName",
                "total" : {
                    "$sum" : 1
                }
            }
        }], function(err, data) {
            var arr = [];
            var num = 0;
            for (var i in data) {
                num += data[i].total;
                arr.push({
                    "归属地" : data[i]._id,
                    "数量" : data[i].total
                });
            }
            cb(err, {
                "视频会议室预定统计" : arr,
                "合计" : num
            });
        });
    },
    //会议室使用率分析
    function(cb) {
        var minTimes = util.getLimitTimesOfDay(startTime, -1);
        var maxTimes = util.getLimitTimesOfDay(endTime, 1);
        var totalHours = util.getIntervalHoursFromTimes(startTime, endTime);
        meetBookModel.aggregate([{
            "$match" : {
                "state" : {
                    "$in" : [2, 5]
                },
                "startTime" : {
                    "$gte" : startTime
                },
                "endTime" : {
                    "$lte" : endTime
                }
            }
        }, {
            "$group" : {
                "_id" : "$name",
                useHours : {
                    "$sum" : "$userTimes"
                }
            }
        }, {
            "$sort" : {
                "useHours" : -1
            }
        }], function(err, data) {
            var rs = [];
            for (var i in data) {
                var item = data[i];
                var useRate = util.forDight(item.useHours*100 / totalHours, 2);
                if(useRate > 100){
                    useRate = 100;
                }
                var obj = {
                    "会议室" : item._id,
                    "使用时间" : item.useHours,
                    "使用率" : useRate.toString() + "%"
                };
                rs.push(obj);
            }
            cb(err, {
                "会议室统计率分析" : rs,
                "总时间(小时数)" : totalHours
            });
        });
    }], function(err, data) {
        db.close();
        Response.end(JSON.stringify({
            "status" : "success",
            "msg" : "统计结果",
            "统计时间" : util.getDateStrFromTimes(startTime, true) + "到" + util.getDateStrFromTimes(endTime, true),
            "data" : data
        }));
    });
}

//判断数组arr里是否已经含有userId
function containUserId(arr, userId) {
    for (var i in arr) {
        var itemUserId = arr[i].userId;
        if (itemUserId == userId) {
            return true;
        }
    }
    return false;
}


exports.Runner = run;

