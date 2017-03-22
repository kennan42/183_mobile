var MEAP = require("meap");
var async = require("async");
var REDIS = require("meap_redis");
var common = require("../common.js");
var util = require("../../base/util.js");


/**
 * 以缓存方式查询下级部门的离职情况
 * @author donghua.wang
 * @date 2015年8月21日 09:55
 * */
var level = null;
var userId = null;
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    level = arg.level;
    userId = arg.userId;
    if (userId.length == 7) {
        userId = "0" + userId;
    }
    Response.setHeader("Content-Type", "text/json;charset=utf8");
    var op = arg.op;
    switch (op) {
        case "tendencyAnaly":
            tendencyAnaly(arg, Response);
            break;
        case "typeAnaly":
            typeAnaly(arg, Response);
            break;
        case "typeAnalyByPage":
            typeAnalyByPage(arg, Response);
            break;
        case "eduAnaly":
            eduAnaly(arg, Response);
            break;
        case "eduAnalyByPage":
            eduAnalyByPage(arg, Response);
            break;
        case "silingAnaly":
            silingAnaly(arg, Response);
            break;
        case "silingAnalyByPage":
            silingAnalyByPage(arg, Response);
            break;
        default:
            Response.end(JSON.stringify({
                "status": "-1",
                "msg": "传递参数错误"
            }));
    }
}

//下级部门离职趋势分析
function tendencyAnaly(arg, Response) {
    var op = arg.op;
    var startMonth = arg.startMonth;
    var endMonth = arg.endMonth;
    var parentDept = "DEPT" + level;
    var parentDeptCodes = common.addSingleQuotationMarks(arg.parentDeptCodes);
    var childLevel = "0" + (parseInt(level) + 1);
    var childDept = "DEPT" + childLevel;
    var childDeptName = "DEPTN" + childLevel;
    var childDeptCodes = common.addSingleQuotationMarks(arg.childDeptCodes);
    
    var data = {
        userId:userId,
        startMonth:startMonth,
        endMonth:endMonth,
        parentDept:parentDept,
        parentDeptCodes:parentDeptCodes,
        childDept:childDept,
        childDeptCodes:childDeptCodes,
        childDeptName:childDeptName
    };
    var sql = util.makeSql(global.sqlMaps.dimissionChild.tendencyAnaly, data);

    var content = sql;
    if (childDeptCodes !== "") {
        content = startMonth + endMonth + parentDept + parentDeptCodes + childDept + childDeptCodes + 
            op + "analyChildDeptDimissionUseCache";
    }
    content = "tendencyAnaly2~" + common.decode2Hash(content);
    var keys = [
        {
            oldKey: "SUM(cttqdc.subjects.erp.hr.leavejob/CA_EMP_LJ_ZZ_OUT.COUNT_NUM)",
            newKey: "LZ_NUM"
        }, {
            oldKey: "SUM(cttqdc.subjects.erp.hr.leavejob/CA_EMP_LJ_ZZ_OUT.COUNT_ZZ)",
            newKey: "ZZ_NUM"
        }, {
            oldKey: "",
            newKey: "RATIO"
        }
    ];
    //common.getHANAData(content, sql, Response, keys);
    common.getHANAData(content, sql, Response, keys, arg, "leaveJobChild", "leaveRate");
}

//下级部门离职类型分析
function typeAnaly(arg, Response) {
    var op = arg.op;
    var startMonth = arg.startMonth;
    var endMonth = arg.endMonth;
    var parentDept = "DEPT" + level;
    var parentDeptCodes = common.addSingleQuotationMarks(arg.parentDeptCodes);
    var childLevel = "0" + (parseInt(level) + 1);
    var childDept = "DEPT" + childLevel;
    var childDeptCodes = common.addSingleQuotationMarks(arg.childDeptCodes);
    var data = {
        userId:userId,
        startMonth:startMonth,
        endMonth:endMonth,
        parentDept:parentDept,
        parentDeptCodes:parentDeptCodes,
        childDept:childDept,
        childDeptCodes:childDeptCodes
    };
    var sql = util.makeSql(global.sqlMaps.dimissionChild.typeAnaly, data);
    var content = sql;
    if (childDeptCodes !== "") {
        content = startMonth + endMonth + parentDept + parentDeptCodes + 
            childDept + childDeptCodes + op + "analyChildDeptDimissionUseCache";
    }
    content = "typeAnaly2~" + common.decode2Hash(content);
    var keys = [
        {
            oldKey: "SUM",
            newKey: "count"
        }
    ];
    //common.getHANAData(content, sql, Response, keys);
    common.getHANAData(content, sql, Response, keys, arg, "leaveJobChild", "type");
}

//下级部门离职类型分析分页查询
function typeAnalyByPage(arg, Response) {
    var op = arg.op;
    var startMonth = arg.startMonth;
    var endMonth = arg.endMonth;
    var parentDept = "DEPT" + level;
    var parentDeptCodes = common.addSingleQuotationMarks(arg.parentDeptCodes);
    var childLevel = "0" + (parseInt(level) + 1);
    var childDept = "DEPT" + childLevel;
    var childDeptName = "DEPTN" + childLevel;
    var childDeptCodes = common.addSingleQuotationMarks(arg.childDeptCodes);

    var reasonc = arg.reasonc;

    var pageSize = arg.pageSize || 15;
    var pageNumber = arg.pageNumber || 1;
    var offset = (pageNumber-1) * pageSize;

    var data = {
        userId:userId,
        startMonth:startMonth,
        endMonth:endMonth,
        parentDept:parentDept,
        parentDeptCodes:parentDeptCodes,
        childDept:childDept,
        childDeptCodes:childDeptCodes,
        reasonc:reasonc,
        pageSize:pageSize,
        offset:offset
    };
    var sql = util.makeSql(global.sqlMaps.dimissionChild.typeAnalyByPage, data);
    var content = "typeAnalyByPage~" + common.decode2Hash(sql);
    var keys = [
        {
            oldKey: "SUM",
            newKey: "count"
        }
    ];
    common.getHANAData(content, sql, Response, keys, arg, "leaveJobChild", "typeByPage");
}

//下级部门离职学历分析
function eduAnaly(arg, Response) {
    var op = arg.op;
    var startMonth = arg.startMonth;
    var endMonth = arg.endMonth;
    var parentDept = "DEPT" + level;
    var parentDeptCodes = common.addSingleQuotationMarks(arg.parentDeptCodes);
    var childLevel = "0" + (parseInt(level) + 1);
    var childDept = "DEPT" + childLevel;
    var childDeptName = "DEPTN" + childLevel;
    var childDeptCodes = common.addSingleQuotationMarks(arg.childDeptCodes);

    var data = {
        userId:userId,
        startMonth:startMonth,
        endMonth:endMonth,
        parentDept:parentDept,
        parentDeptCodes:parentDeptCodes,
        childDept:childDept,
        childDeptCodes:childDeptCodes
    };
    var sql = util.makeSql(global.sqlMaps.dimissionChild.eduAnaly, data);
    var content = sql;
    if (childDeptCodes !== "") {
        content = startMonth + endMonth + parentDept + parentDeptCodes + childDept + 
            childDeptCodes + op + "analyChildDeptDimissionUseCache";
    }
    content = "eduAnaly2~" + common.decode2Hash(content);
    var keys = [
        {
            oldKey: "SUM",
            newKey: "count"
        }
    ];
    common.getHANAData(content, sql, Response, keys, arg, "leaveJobChild", "edu");
}

//下级部门离职学历分析分页查询
function eduAnalyByPage(arg, Response) {
    var op = arg.op;
    var startMonth = arg.startMonth;
    var endMonth = arg.endMonth;
    var parentDept = "DEPT" + level;
    var parentDeptCodes = common.addSingleQuotationMarks(arg.parentDeptCodes);
    var childLevel = "0" + (parseInt(level) + 1);
    var childDept = "DEPT" + childLevel;
    var childDeptName = "DEPTN" + childLevel;
    var childDeptCodes = common.addSingleQuotationMarks(arg.childDeptCodes);

    var pageSize = arg.pageSize || 15;
    var pageNumber = arg.pageNumber || 1;
    var offset = (pageNumber-1) * pageSize;

    var slart = arg.slart;

    var data = {
        userId:userId,
        startMonth:startMonth,
        endMonth:endMonth,
        parentDept:parentDept,
        parentDeptCodes:parentDeptCodes,
        childDept:childDept,
        childDeptCodes:childDeptCodes,
        slart:slart,
        pageSize:pageSize,
        offset:offset
    };
    var sql = util.makeSql(global.sqlMaps.dimissionChild.eduAnalyByPage, data);
    var content = "eduAnalyByPage~" + common.decode2Hash(sql);
    var keys = [
        {
            oldKey: "SUM",
            newKey: "count"
        }
    ];
    common.getHANAData(content, sql, Response, keys, arg, "leaveJobChild", "eduByPage");
}

//下级部门离职司龄分析
function silingAnaly(arg, Response) {
    var op = arg.op;
    var startMonth = arg.startMonth;
    var endMonth = arg.endMonth;
    var parentDept = "DEPT" + level;
    var parentDeptCodes = common.addSingleQuotationMarks(arg.parentDeptCodes);
    var childLevel = "0" + (parseInt(level) + 1);
    var childDept = "DEPT" + childLevel;
    var childDeptName = "DEPTN" + childLevel;
    var childDeptCodes = common.addSingleQuotationMarks(arg.childDeptCodes);

    var data = {
        userId:userId,
        startMonth:startMonth,
        endMonth:endMonth,
        parentDept:parentDept,
        parentDeptCodes:parentDeptCodes,
        childDept:childDept,
        childDeptCodes:childDeptCodes
    };
    var sql = util.makeSql(global.sqlMaps.dimissionChild.silingAnaly, data);
    var content = sql;
    if (childDeptCodes !== "") {
        content = startMonth + endMonth + parentDept + parentDeptCodes + childDept + childDeptCodes + 
            op + "analyChildDeptDimissionUseCache";
    }
    content = "silingAnaly2~" + common.decode2Hash(content);
    var keys = [
        {
            oldKey: "SUM",
            newKey: "count"
        }
    ];
    common.getHANAData(content, sql, Response, keys, arg, "leaveJobChild", "siling");
}

//下级部门离职司龄分析分页查询
function silingAnalyByPage(arg, Response) {
    var op = arg.op;
    var startMonth = arg.startMonth;
    var endMonth = arg.endMonth;
    var parentDept = "DEPT" + level;
    var parentDeptCodes = common.addSingleQuotationMarks(arg.parentDeptCodes);
    var childLevel = "0" + (parseInt(level) + 1);
    var childDept = "DEPT" + childLevel;
    var childDeptName = "DEPTN" + childLevel;
    var childDeptCodes = common.addSingleQuotationMarks(arg.childDeptCodes);

    var pageSize = arg.pageSize || 15;
    var pageNumber = arg.pageNumber || 1;
    var offset = (pageNumber-1) * pageSize;

    var slRangeId = arg.slRangeId;

    var data = {
        userId:userId,
        startMonth:startMonth,
        endMonth:endMonth,
        parentDept:parentDept,
        parentDeptCodes:parentDeptCodes,
        childDept:childDept,
        childDeptCodes:childDeptCodes,
        slRangeId:slRangeId,
        pageSize:pageSize,
        offset:offset
    };
    var sql = util.makeSql(global.sqlMaps.dimissionChild.silingAnalyByPage, data);
    var content = "silingAnalyByPage~" + common.decode2Hash(sql);
    var keys = [
        {
            oldKey: "SUM",
            newKey: "count"
        }
    ];
    common.getHANAData(content, sql, Response, keys, arg, "leaveJobChild", "silingByPage");
}



exports.Runner = run;
