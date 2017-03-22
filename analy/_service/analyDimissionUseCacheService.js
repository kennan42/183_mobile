var common = require("../common.js");
var util = require("../../base/util.js");

var analyDimissionUserCacheService = {
    //离职趋势分析
    tendencyAnaly : function(arg,Response){
        var userId = arg.userId;
        var op = arg.op;
        var startMonth = arg.startMonth;
        var endMonth = arg.endMonth;
        var deptCodes = common.addSingleQuotationMarks(arg.deptCodes);
        var level = arg.level;
        var deptCode = "DEPT" + level;
        var deptName = "DEPTN" + level;

        var data = {
            startMonth:startMonth,
            endMonth:endMonth,
            userId:arg.userId,
            deptCodes:deptCodes,
            deptCode:deptCode,
            deptName:deptName
        };
        var sql = util.makeSql(global.sqlMaps.dimission.tendencyAnaly, data);
        var content = null;
        if (deptCodes === "") {
            content = sql;
        } else {
            content = startMonth + endMonth + deptCodes + level + deptCode + deptName + op + "analyDimissionUseCache";
        }
        content = "tendencyAnaly1~" + common.decode2Hash(content);
        var keys = [
            { oldKey: "SUM(cttqdc.subjects.erp.hr.leavejob/CA_EMP_LJ_ZZ_OUT.COUNT_NUM)", newKey: "LZ_NUM" }, 
            { oldKey: "SUM(cttqdc.subjects.erp.hr.leavejob/CA_EMP_LJ_ZZ_OUT.COUNT_ZZ)", newKey: "ZZ_NUM" }, 
            { oldKey: "", newKey: "RATIO" } 
        ];
        common.getHANAData(content, sql, Response, keys, arg, "leaveJob", "leaveRate");
    },

    //离职类型分析
    typeAnaly:function(arg,Response){
        var userId = arg.userId;
        var op = arg.op;
        var startMonth = arg.startMonth;
        var endMonth = arg.endMonth;
        var deptCodes = common.addSingleQuotationMarks(arg.deptCodes);
        var level = arg.level;
        var deptCode = "DEPT" + level;

        var data = {
            startMonth:startMonth,
            endMonth:endMonth,
            userId:arg.userId,
            deptCodes:deptCodes,
            deptCode:deptCode
        };
        var sql = util.makeSql(global.sqlMaps.dimission.typeAnaly, data);
    
        var content = null;
        if (deptCodes === "") {
            content = sql;
        } else {
            content = startMonth + endMonth + deptCodes + level + deptCode +  op + "analyDimissionUseCache";
        }
        content = "typeAnaly1~" + common.decode2Hash(content);
        var keys = [
            {
                oldKey: "LZ_NUM",
                newKey: "count"
            }
        ];
        common.getHANAData(content, sql, Response, keys, arg, "leaveJob", "type");
    },

    //离职类型分页查询
    typeAnalyByPage:function(arg,Response){
        var userId= arg.userId;
        var startMonth = arg.startMonth;
        var endMonth = arg.endMonth;
        var deptCodes = common.addSingleQuotationMarks(arg.deptCodes);
        var level = arg.level;
        var deptCode = "DEPT" + level;

        var pageSize = arg.pageSize || 15;
        var pageNumber = arg.pageNumber || 1;
        var offset = (pageNumber-1) * pageSize;

        var reasonc = arg.reasonc;

        var data = {
            userId:userId,
            startMonth:startMonth,
            endMonth:endMonth,
            reasonc:reasonc,
            deptCode:deptCode,
            deptCodes:deptCodes,
            pageSize:pageSize,
            offset:offset
        };
        var sql = util.makeSql(global.sqlMaps.dimission.typeAnalyByPage, data);

        var content = sql;
        content = "typeAnalyByPage~" + common.decode2Hash(content);
        var keys = [
            {
                oldKey: "LZ_NUM",
                newKey: "count"
            }
        ];
        common.getHANAData(content, sql, Response, keys, arg, "leaveJob", "typeByPage");

    },

    //离职学历分析
    eduAnaly:function(arg,Response){
        var userId = arg.userId;
        var op = arg.op;
        var startMonth = arg.startMonth;
        var endMonth = arg.endMonth;
        var deptCodes = common.addSingleQuotationMarks(arg.deptCodes);
        var level = arg.level;
        var deptCode = "DEPT" + level;

        var data = {
            startMonth:startMonth,
            endMonth:endMonth,
            userId:arg.userId,
            deptCodes:deptCodes,
            deptCode:deptCode
        };
        var sql = util.makeSql(global.sqlMaps.dimission.eduAnaly, data);
    
        var content = null;
        if (deptCodes === "") {
            content = sql;
        } else {
            content = startMonth + endMonth + deptCodes + level + deptCode  + op + "analyDimissionUseCache";
        }
        content = "eduAnaly1~" + common.decode2Hash(content);
        var keys = [
            {
                oldKey: "LZ_NUM",
                newKey: "count"
            }
        ];
        common.getHANAData(content, sql, Response, keys, arg, "leaveJob", "edu");
    },

    //离职学历分页查询
    eduAnalyByPage:function(arg,Response){
        var userId = arg.userId;
        var startMonth = arg.startMonth;
        var endMonth = arg.endMonth;
        var deptCodes = common.addSingleQuotationMarks(arg.deptCodes);
        var level = arg.level;
        var deptCode = "DEPT" + level;

        var pageSize = arg.pageSize || 15;
        var pageNumber = arg.pageNumber || 1;
        var offset = (pageNumber-1) * pageSize;

        var slart = arg.slart;

        var data = {
            userId:userId,
            startMonth:startMonth,
            endMonth:endMonth,
            slart:slart,
            deptCode:deptCode,
            deptCodes:deptCodes,
            pageSize:pageSize,
            offset:offset
        };
        var sql = util.makeSql(global.sqlMaps.dimission.eduAnalyByPage, data);
        var content = sql;
        content = "eduAnalyByPage~" + common.decode2Hash(content);
        var keys = [
            {
                oldKey: "LZ_NUM",
                newKey: "count"
            }
        ];
        common.getHANAData(content, sql, Response, keys, arg, "leaveJob", "eduByPage");            
    },

    //离职司龄分析
    silingAnaly:function(arg,Response){
        var userId = arg.userId;
        var op = arg.op;
        var startMonth = arg.startMonth;
        var endMonth = arg.endMonth;
        var deptCodes = common.addSingleQuotationMarks(arg.deptCodes);
        var level = arg.level;
        var deptCode = "DEPT" + level;
        var deptName = "DEPTN" + level;

        var data = {
            startMonth:startMonth,
            endMonth:endMonth,
            userId:arg.userId,
            deptCodes:deptCodes,
            deptCode:deptCode
        };
        var sql = util.makeSql(global.sqlMaps.dimission.silingAnaly, data);
        var content = sql;
        if (deptCodes !== "") {
            content = startMonth + endMonth + deptCodes + level + deptCode + deptName + op + "analyDimissionUseCache";
        }
        content = "silingAnaly1~" + common.decode2Hash(content);
        var keys = [
            {
                oldKey: "LZ_NUM",
                newKey: "count"
            }
        ];
        common.getHANAData(content, sql, Response, keys, arg, "leaveJob", "siling");
    },

    //离职司龄分页查询
    silingAnalyByPage:function(arg,Response){
        var userId = arg.userId;
        var startMonth = arg.startMonth;
        var endMonth = arg.endMonth;
        var deptCodes = common.addSingleQuotationMarks(arg.deptCodes);
        var level = arg.level;
        var deptCode = "DEPT" + level;

        var pageSize = arg.pageSize || 15;
        var pageNumber = arg.pageNumber || 1;
        var offset = (pageNumber-1) * pageSize;

        var slRangeId = arg.slRangeId;

        var data = {
            userId:userId,
            startMonth:startMonth,
            endMonth:endMonth,
            slRangeId:slRangeId,
            deptCode:deptCode,
            deptCodes:deptCodes,
            pageSize:pageSize,
            offset:offset
        };
        var sql = util.makeSql(global.sqlMaps.dimission.silingAnalyByPage, data);
        var content = sql;
        content = "silingAnalyByPage~" + common.decode2Hash(content);
        var keys = [
            {
                oldKey: "LZ_NUM",
                newKey: "count"
            }
        ];
        common.getHANAData(content, sql, Response, keys, arg, "leaveJob", "silingByPage");            

    }

};

module.exports = analyDimissionUserCacheService;
