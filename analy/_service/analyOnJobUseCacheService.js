//var MEAP = require("meap");
//var async = require("async");
var common = require("../common.js");
var util = require("../../base/util.js");


var analyOnJobUseCacheService = {
    //在职人员数量分析
    analyOnjobCount: function (arg, Response) {
        var level = arg.level;
        var deptCode = "DEPT" + level;
        var deptName = "DEPTN" + level;
        var deptCodes = common.addSingleQuotationMarks(arg.deptCodes);
        var queryYear = arg.queryYear;
        var queryMonth = arg.queryMonth;
        var queryDate = common.getQueryDate(queryYear, queryMonth);
        var userId = arg.userId;
        var op = arg.op;

        var data = {
            queryDate:queryDate,
            deptCodes:deptCodes,
            deptCode:deptCode,
            deptName:deptName,
            userId:userId
        };
        var sql = util.makeSql(global.sqlMaps.onJob.analyOnjobCount, data);

        var content = null;
        if (deptCodes === "") {//缓存SQL
            content = sql;
        } else {
            content = level + deptCode + deptName + deptCodes + queryDate + op + "analyOnJobUseCache";
        }
        content = "analyOnjobCount1~" + common.decode2Hash(content);
        var keys = [
            { oldKey: "COUNT_NUM", newKey: "count" }
        ];
        //common.getHANAData(content, sql, Response, keys);
        common.getHANAData(content, sql, Response, keys, arg, "onJob", "count");
    },

    //在职人员性别分析
    analyOnjobSex : function(arg, Response) {
        var level = arg.level;
        var deptCode = "DEPT" + level;
        var deptCodes = common.addSingleQuotationMarks(arg.deptCodes);
        var queryYear = arg.queryYear;
        var queryMonth = arg.queryMonth;
        var queryDate = common.getQueryDate(queryYear, queryMonth);
        var userId = arg.userId;
        var op = arg.op;

        var data = {
            queryDate:queryDate,
            deptCodes:deptCodes,
            deptCode:deptCode,
            userId:userId
        };
        var sql = util.makeSql(global.sqlMaps.onJob.analyOnjobSex, data);

        var content = "";
        if (deptCodes === "") {//缓存SQL
            content = sql;
        } else {
            content = level + deptCode + deptCodes + queryDate + op + "analyOnJobUseCache";
        }
        content = "analyOnjobSex1~" + common.decode2Hash(content);
        var keys = [
            {
                oldKey: "COUNT_NUM",
                newKey: "count"
            }
        ];
        //common.getHANAData(content, sql, Response, keys);
        common.getHANAData(content, sql, Response, keys, arg, "onJob", "sex");
    },


    //在职人员性别分页查询
    analyOnjobSexByPage:function(arg,Response){
        var level = arg.level;
        var deptCode = "DEPT" + level;
        var deptCodes = common.addSingleQuotationMarks(arg.deptCodes);

        var queryYear = arg.queryYear;
        var queryMonth = arg.queryMonth;
        var queryDate = common.getQueryDate(queryYear, queryMonth);

        var pageSize = arg.pageSize || 15;
        var pageNumber = arg.pageNumber || 1;
        var offset = (pageNumber-1) * pageSize;

        var userId = arg.userId;
        var gesch = arg.gesch;
        var op = arg.op;

        var data = {
            userId:userId,
            queryDate:queryDate,
            gesch:gesch,
            deptCode:deptCode,
            deptCodes:deptCodes,
            pageSize:pageSize,
            offset:offset
        };
        var sql = util.makeSql(global.sqlMaps.onJob.analyOnjobSexByPage , data);
        var content = sql;
        content = "analyOnjobSexByPage~" + common.decode2Hash(content);
        var keys = [
            {
                oldKey: "COUNT_NUM",
                newKey: "count"
            }
        ];
        common.getHANAData(content, sql, Response, keys, arg, "onJob", "sexByPage");
        
    },


    //在职人员学历分析
    analyOnjobEducation : function (arg, Response) {
        var level = arg.level;
        var deptCode = "DEPT" + level;
        var deptCodes = common.addSingleQuotationMarks(arg.deptCodes);
        var queryYear = arg.queryYear;
        var queryMonth = arg.queryMonth;
        var queryDate = common.getQueryDate(queryYear, queryMonth);
        var userId = arg.userId;
        var op = arg.op;

        var data = {
            queryDate:queryDate,
            deptCodes:deptCodes,
            deptCode:deptCode,
            userId:userId
        };
        var sql = util.makeSql(global.sqlMaps.onJob.analyOnjobEducation, data);

        var content = "";
        if (deptCodes === "") {//缓存SQL
            content = sql;
        } else {
            content = level + deptCode + deptCodes + queryDate + op + "analyOnJobUseCache";
        }
        content = "analyOnjobEducation1~" + common.decode2Hash(content);
        var keys = [
            {
                oldKey: "COUNT_NUM",
                newKey: "count"
            }
        ];
        common.getHANAData(content, sql, Response, keys, arg, "onJob", "edu");
    },

    //在职人员学历分页查询
    analyOnjobEducationByPage : function (arg, Response) {
        var level = arg.level;
        var deptCode = "DEPT" + level;
        var deptCodes = common.addSingleQuotationMarks(arg.deptCodes);
        var queryYear = arg.queryYear;
        var queryMonth = arg.queryMonth;
        var queryDate = common.getQueryDate(queryYear, queryMonth);

        var pageSize = arg.pageSize || 15;
        var pageNumber = arg.pageNumber || 1;
        var offset = (pageNumber-1) * pageSize;

        var userId = arg.userId;
        var slart = arg.slart;
        var op = arg.op;

        var data = {
            userId:userId,
            queryDate:queryDate,
            slart:slart,
            deptCode:deptCode,
            deptCodes:deptCodes,
            pageSize:pageSize,
            offset:offset
        };
        var sql = util.makeSql(global.sqlMaps.onJob.analyOnjobEducationByPage, data);
        var content = sql;
        content = "analyOnjobEducationByPage~" + common.decode2Hash(content);
        var keys = [
            {
                oldKey: "COUNT_NUM",
                newKey: "count"
            }
        ];
        common.getHANAData(content, sql, Response, keys, arg, "onJob", "eduByPage");
    },



    //在职人员司龄分析
    analyOnjobSiling:function(arg, Response){
        var level = arg.level;
        var deptCode = "DEPT" + level;
        var deptCodes = common.addSingleQuotationMarks(arg.deptCodes);
        var queryYear = arg.queryYear;
        var queryMonth = arg.queryMonth;
        var userId = arg.userId;
        var queryDate = common.getQueryDate(queryYear, queryMonth);
        var op = arg.op;

        var data = {
            queryDate:queryDate,
            deptCodes:deptCodes,
            deptCode:deptCode,
            userId:userId
        };
        var sql = util.makeSql(global.sqlMaps.onJob.analyOnjobSiling, data);

        var content = null;
        if (deptCodes === "") {//缓存SQL
            content = sql;
        } else {
            content = level + deptCode + deptCodes + queryDate + op + "analyOnJobUseCache";
        }
        content = "analyOnjobSiling1~" + common.decode2Hash(content);
        var keys = [
            {
                oldKey: "COUNT_NUM",
                newKey: "count"
            }
        ];
        common.getHANAData(content, sql, Response, keys, arg, "onJob", "siling");
    },

    //在职人员司龄分页查询
    analyOnjobSilingByPage:function(arg, Response){
        var level = arg.level;
        var deptCode = "DEPT" + level;
        var deptCodes = common.addSingleQuotationMarks(arg.deptCodes);
        var queryYear = arg.queryYear;
        var queryMonth = arg.queryMonth;
        var queryDate = common.getQueryDate(queryYear, queryMonth);

        var pageSize = arg.pageSize || 15;
        var pageNumber = arg.pageNumber || 1;
        var offset = (pageNumber-1) * pageSize;

        var userId = arg.userId;
        var slRangeId = arg.slRangeId;//司龄id
        var op = arg.op;

        var data = {
            userId:userId,
            queryDate:queryDate,
            slRangeId:slRangeId,
            deptCode:deptCode,
            deptCodes:deptCodes,
            pageSize:pageSize,
            offset:offset
        };
        var sql = util.makeSql(global.sqlMaps.onJob.analyOnjobSilingByPage, data);

        var content = sql;
        content = "analyOnjobSilingByPage~" + common.decode2Hash(content);
        var keys = [
            {
                oldKey: "COUNT_NUM",
                newKey: "count"
            }
        ];
        common.getHANAData(content, sql, Response, keys, arg, "onJob", "silingByPage");
    },

    //在职人员年龄分析
    analyOnjobAge : function(arg, Response) {
        var level = arg.level;
        var deptCode = "DEPT" + level;
        var deptCodes = common.addSingleQuotationMarks(arg.deptCodes);
        var queryYear = arg.queryYear;
        var queryMonth = arg.queryMonth;
        var queryDate = common.getQueryDate(queryYear, queryMonth);
        var userId = arg.userId;
        var op = arg.op;

        var data = {
            queryDate:queryDate,
            deptCodes:deptCodes,
            deptCode:deptCode,
            userId:userId
        };
        var sql = util.makeSql(global.sqlMaps.onJob.analyOnjobAge, data);

        var content = null;
        if (deptCodes === "") {//缓存SQL
            content = sql;
        } else {
            content = level + deptCode + deptCodes + queryDate + op + "analyOnJobUseCache";
        }
        content = "analyOnjobAge1~" + common.decode2Hash(content);
        var keys = [
            {
                oldKey: "COUNT_NUM",
                newKey: "count"
            }
        ];
        common.getHANAData(content, sql, Response, keys, arg, "onJob", "age");
    },

    //在职人员年龄分页查询
    analyOnjobAgeByPage : function(arg, Response) {
        var level = arg.level;
        var deptCode = "DEPT" + level;
        var deptCodes = common.addSingleQuotationMarks(arg.deptCodes);
        var queryYear = arg.queryYear;
        var queryMonth = arg.queryMonth;
        var queryDate = common.getQueryDate(queryYear, queryMonth);


        var pageSize = arg.pageSize || 15;
        var pageNumber = arg.pageNumber || 1;
        var offset = (pageNumber-1) * pageSize;

        var userId = arg.userId;
        var ageId = arg.ageId;
        var op = arg.op;

        var data = {
            userId:userId,
            queryDate:queryDate,
            ageId:ageId,
            deptCode:deptCode,
            deptCodes:deptCodes,
            pageSize:pageSize,
            offset:offset
        };
        var sql = util.makeSql(global.sqlMaps.onJob.analyOnjobAgeByPage, data);
        var content = sql;
        content = "analyOnjobAgeByPage~" + common.decode2Hash(content);
        var keys = [
            {
                oldKey: "COUNT_NUM",
                newKey: "count"
            }
        ];
        common.getHANAData(content, sql, Response, keys, arg, "onJob", "ageByPage");
    },

    //在职人员技能分析
    analyOnjobTecAndDuty : function (arg, Response) {
        var userId = arg.userId;
        var level = arg.level;
        var deptCode = "DEPT" + level;
        var deptCodes = common.addSingleQuotationMarks(arg.deptCodes);
        var queryYear = arg.queryYear;
        var queryMonth = arg.queryMonth;
        var queryDate = common.getQueryDate(queryYear, queryMonth);
        var op = arg.op;

        var data = {
            queryDate:queryDate,
            deptCodes:deptCodes,
            deptCode:deptCode,
            userId:userId
        };
        var sql = util.makeSql(global.sqlMaps.onJob.analyOnjobTecAndDuty, data);

        var content = null;
        if (deptCodes === "") {//缓存SQL
            content = sql;
        } else {
            content = level + deptCode + deptCodes + queryDate + op + "analyOnJobUseCache";
        }
        content = "analyOnjobTecAndDuty1~" + common.decode2Hash(content);
        var keys = [
            { oldKey: "COUNT_NUM", newKey: "count" }
        ];
        common.getHANAData(content, sql, Response, keys, arg, "onJob", "tecAndDuty");
    },

    //在职人员技能分页查询
    analyOnjobTecAndDutyByPage : function (arg, Response) {
        var level = arg.level;
        var deptCode = "DEPT" + level;
        var deptCodes = common.addSingleQuotationMarks(arg.deptCodes);

        var queryYear = arg.queryYear;
        var queryMonth = arg.queryMonth;
        var queryDate = common.getQueryDate(queryYear, queryMonth);

        var pageSize = arg.pageSize || 15;
        var pageNumber = arg.pageNumber || 1;
        var offset = (pageNumber-1) * pageSize;

        var userId = arg.userId;
        var op = arg.op;
        var tzj = arg.tzj;

        var data = {
            userId:userId,
            queryDate:queryDate,
            deptCode:deptCode,
            deptCodes:deptCodes,
            pageSize:pageSize,
            tzj:tzj,
            offset:offset,
            pageSize:pageSize
        };
        var sql = util.makeSql(global.sqlMaps.onJob.analyOnjobTecAndDutyByPage, data);

        var content = sql;
        content = "analyOnjobTecAndDutyByPage~" + common.decode2Hash(content);
        var keys = [
            {
                oldKey: "COUNT_NUM",
                newKey: "count"
            }
        ];
        common.getHANAData(content, sql, Response, keys, arg, "onJob", "tecAndDutyByPage");
    }

};

module.exports = analyOnJobUseCacheService;
