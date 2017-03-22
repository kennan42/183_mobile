var MEAP = require("meap");
var async = require("async");
var common = require("../common.js");
var REDIS = require("meap_redis");
var util = require("../../base/util.js");

/**
 * 以缓存方式查询在职下级部门统计分析
 * @author donghua.wang
 * @date 2015年8月20日 16:15
 * @update 2016年5月30日
 * */
var level = null;
var userId = null;
var queryDate = null;
function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type", "text/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
    level = arg.level;
    userId = arg.userId;
    if (userId.length == 7) {
        userId = "0" + userId;
    }
    var currentDate = common.getCurrentDate();
    var queryYear = arg.queryYear;
    var queryMonth = arg.queryMonth;
    queryDate = common.getQueryDate(queryYear, queryMonth);
    if (queryDate > currentDate) {
        Response.end(JSON.stringify({
            "status": "-1",
            "msg": "无法查询今天以后的数据",
            "data": []
        }));
        return;
    }
    var op = arg.op;
    if (op == null || op == '') {
        Response.end(JSON.stringify({
            "status": "-1",
            "msg": "传递参数错误"
        }));
        return;
    }
    switch (op) {
        case 'analyOnjobCount':
            analyOnjobCount(arg, Response);
            break;
        case 'analyOnjobSex':
            analyOnjobSex(arg, Response);
            break;
        case 'analyOnjobSexByPage':
            analyOnjobSexByPage(arg, Response);
            break;
        case 'analyOnjobEducation':
            analyOnjobEducation(arg, Response);
            break;
        case 'analyOnjobEducationByPage':
            analyOnjobEducationByPage(arg, Response);
            break;
        case 'analyOnjobSiling':
            analyOnjobSiling(arg, Response);
            break;
        case 'analyOnjobSilingByPage':
            analyOnjobSilingByPage(arg, Response);
            break;
        case 'analyOnjobAge':
            analyOnjobAge(arg, Response);
            break;
        case 'analyOnjobAgeByPage':
            analyOnjobAgeByPage(arg, Response);
            break;
        case 'analyOnjobTecAndDuty':
            analyOnjobTecAndDuty(arg, Response);
            break;
        case 'analyOnjobTecAndDutyByPage':
            analyOnjobTecAndDutyByPage(arg, Response);
            break;
        default:
            Response.end(JSON.stringify({
                "status": "-1",
                "msg": "传递参数错误"
            }));
    }
}

//在职人员数量分析
function analyOnjobCount(arg, Response) {
    var childLevel = "0" + (parseInt(level) + 1);
    var parentDept = "DEPT" + level;
    var childDept = "DEPT" + childLevel;
    var childDeptName = "DEPTN" + childLevel;
    var parentDeptCodes = common.addSingleQuotationMarks(arg.parentDeptCodes);
    var childDeptCodes = common.addSingleQuotationMarks(arg.childDeptCodes);
    var op = arg.op;

    var data = {
        userId:userId,
        queryDate:queryDate,
        parentDept:parentDept,
        parentDeptCodes:parentDeptCodes,
        childDept:childDept,
        childDeptCodes:childDeptCodes,
        childDeptName:childDeptName
    };
    var sql = util.makeSql(global.sqlMaps.onJobChild.analyOnjobCount, data);

    var content = null;
    if (childDeptCodes === "") {//缓存SQL
        content = sql;
    } else {
        content = level + childDept + childDeptName + parentDeptCodes + childDeptCodes + queryDate + 
            op + "analyChildDeptOnJobUserCache";
    }
    content = "analyOnjobCount2~" + common.decode2Hash(content);
    var keys = [
        {
            oldKey: "SUM",
            newKey: "count"
        }
    ];
    //common.getHANAData(content, sql, Response, keys);
    common.getHANAData(content, sql, Response, keys, arg, "onJobChild", "count");
}

//在职人员性别分析
function analyOnjobSex(arg, Response) {
    var childLevel = "0" + (parseInt(level) + 1);
    var parentDept = "DEPT" + level;
    var childDept = "DEPT" + childLevel;
    var parentDeptCodes = common.addSingleQuotationMarks(arg.parentDeptCodes);
    var childDeptCodes = common.addSingleQuotationMarks(arg.childDeptCodes);
    var op = arg.op;

    var data = {
        userId:userId,
        queryDate:queryDate,
        parentDept:parentDept,
        parentDeptCodes:parentDeptCodes,
        childDept:childDept,
        childDeptCodes:childDeptCodes
    };
    var sql = util.makeSql(global.sqlMaps.onJobChild.analyOnjobSex, data);
    var content = "";
    if (childDeptCodes === "") {//缓存SQL
        content = sql;
    } else {
        content = level + parentDeptCodes + childDeptCodes + queryDate + op + "analyChildDeptOnJobUserCache";
    }
    content = "analyOnjobSex2~" + common.decode2Hash(content);
    var keys = [
        {
            oldKey: "SUM",
            newKey: "count"
        }
    ];
    //common.getHANAData(content, sql, Response, keys);
    common.getHANAData(content, sql, Response, keys, arg, "onJobChild", "sex");
}


//在职人员性别分析分页查询
function analyOnjobSexByPage(arg, Response) {
    var childLevel = "0" + (parseInt(level) + 1);
    var parentDept = "DEPT" + level;
    var childDept = "DEPT" + childLevel;
    var parentDeptCodes = common.addSingleQuotationMarks(arg.parentDeptCodes);
    var childDeptCodes = common.addSingleQuotationMarks(arg.childDeptCodes);
    var op = arg.op;
    
    var gesch = arg.gesch;

    var pageSize = arg.pageSize || 15;
    var pageNumber = arg.pageNumber || 1;
    var offset = (pageNumber-1) * pageSize;

    var data = {
        userId:userId,
        queryDate:queryDate,
        parentDept:parentDept,
        parentDeptCodes:parentDeptCodes,
        childDept:childDept,
        childDeptCodes:childDeptCodes,
        gesch:gesch,
        pageSize:pageSize,
        offset:offset
    };
    var sql = util.makeSql(global.sqlMaps.onJobChild.analyOnjobSexByPage, data);
    var content = sql;
    content = "analyOnjobSexByPage~" + common.decode2Hash(content);
    var keys = [
        {
            oldKey: "SUM",
            newKey: "count"
        }
    ];
    common.getHANAData(content, sql, Response, keys, arg, "onJobChild", "sexByPage");
}

//在职人员学历分析
function analyOnjobEducation(arg, Response) {
    var childLevel = "0" + (parseInt(level) + 1);
    var parentDept = "DEPT" + level;
    var childDept = "DEPT" + childLevel;
    var parentDeptCodes = common.addSingleQuotationMarks(arg.parentDeptCodes);
    var childDeptCodes = common.addSingleQuotationMarks(arg.childDeptCodes);
    var op = arg.op;

    var data = {
        userId:userId,
        queryDate:queryDate,
        parentDept:parentDept,
        parentDeptCodes:parentDeptCodes,
        childDept:childDept,
        childDeptCodes:childDeptCodes
    };
    var sql = util.makeSql(global.sqlMaps.onJobChild.analyOnjobEducation, data);
    var content = "";
    if (childDeptCodes === "") {//缓存SQL
        content = sql;
    } else {
        content = level + parentDeptCodes + childDeptCodes + queryDate + op + "analyChildDeptOnJobUserCache";
    }
    content = "analyOnjobEducation2~" + common.decode2Hash(content);
    var keys = [
        {
            oldKey: "SUM",
            newKey: "count"
        }
    ];
    //common.getHANAData(content, sql, Response, keys);
    common.getHANAData(content, sql, Response, keys, arg, "onJobChild", "edu");
}

//在职人员学历分析分页查询
function analyOnjobEducationByPage(arg, Response) {
    var childLevel = "0" + (parseInt(level) + 1);
    var parentDept = "DEPT" + level;
    var childDept = "DEPT" + childLevel;
    var parentDeptCodes = common.addSingleQuotationMarks(arg.parentDeptCodes);
    var childDeptCodes = common.addSingleQuotationMarks(arg.childDeptCodes);
    var op = arg.op;

    var slart = arg.slart;

    var pageSize = arg.pageSize || 15;
    var pageNumber = arg.pageNumber || 1;
    var offset = (pageNumber-1) * pageSize;

    var data = {
        userId:userId,
        queryDate:queryDate,
        parentDept:parentDept,
        parentDeptCodes:parentDeptCodes,
        childDept:childDept,
        childDeptCodes:childDeptCodes,
        slart:slart,
        pageSize:pageSize,
        offset:offset
    };
    var sql = util.makeSql(global.sqlMaps.onJobChild.analyOnjobEducationByPage, data);
    var content = "analyOnjobEducationByPage~" + common.decode2Hash(sql);
    var keys = [
        {
            oldKey: "SUM",
            newKey: "count"
        }
    ];
    common.getHANAData(content, sql, Response, keys, arg, "onJobChild", "eduByPage");
}

//在职人员司龄分析
function analyOnjobSiling(arg, Response) {
    var childLevel = "0" + (parseInt(level) + 1);
    var parentDept = "DEPT" + level;
    var childDept = "DEPT" + childLevel;
    var parentDeptCodes = common.addSingleQuotationMarks(arg.parentDeptCodes);
    var childDeptCodes = common.addSingleQuotationMarks(arg.childDeptCodes);
    var op = arg.op;
    
    var data = {
        userId:userId,
        queryDate:queryDate,
        parentDept:parentDept,
        parentDeptCodes:parentDeptCodes,
        childDept:childDept,
        childDeptCodes:childDeptCodes
    };
    var sql = util.makeSql(global.sqlMaps.onJobChild.analyOnjobSiling, data);
    var content = null;
    if (childDeptCodes === "") {//缓存SQL
        content = sql;
    } else {
        content = level + parentDeptCodes + childDeptCodes + queryDate + op + "analyChildDeptOnJobUserCache";
    }
    content = "analyOnjobSiling2~" + common.decode2Hash(content);
    var keys = [
        {
            oldKey: "SUM",
            newKey: "count"
        }
    ];
    //common.getHANAData(content, sql, Response, keys);
    common.getHANAData(content, sql, Response, keys, arg, "onJobChild", "siling");
}

//在职人员司龄分析分页查询
function analyOnjobSilingByPage(arg, Response) {
    var childLevel = "0" + (parseInt(level) + 1);
    var parentDept = "DEPT" + level;
    var childDept = "DEPT" + childLevel;
    var parentDeptCodes = common.addSingleQuotationMarks(arg.parentDeptCodes);
    var childDeptCodes = common.addSingleQuotationMarks(arg.childDeptCodes);
    var op = arg.op;

    var slRangeId = arg.slRangeId;

    var pageSize = arg.pageSize || 15;
    var pageNumber = arg.pageNumber || 1;
    var offset = (pageNumber-1) * pageSize;

    var data = {
        userId:userId,
        queryDate:queryDate,
        parentDept:parentDept,
        parentDeptCodes:parentDeptCodes,
        childDept:childDept,
        childDeptCodes:childDeptCodes,
        slRangeId:slRangeId,
        pageSize:pageSize,
        offset:offset
    };
    var sql = util.makeSql(global.sqlMaps.onJobChild.analyOnjobSilingByPage, data);
    var content = "analyOnjobSilingByPage~" + common.decode2Hash(sql);
    var keys = [
        {
            oldKey: "SUM",
            newKey: "count"
        }
    ];
    common.getHANAData(content, sql, Response, keys, arg, "onJobChild", "silingByPage");
}

//在职人员年龄分析
function analyOnjobAge(arg, Response) {
    var childLevel = "0" + (parseInt(level) + 1);
    var parentDept = "DEPT" + level;
    var childDept = "DEPT" + childLevel;
    var parentDeptCodes = common.addSingleQuotationMarks(arg.parentDeptCodes);
    var childDeptCodes = common.addSingleQuotationMarks(arg.childDeptCodes);
    var op = arg.op;

    var data = {
        userId:userId,
        queryDate:queryDate,
        parentDept:parentDept,
        parentDeptCodes:parentDeptCodes,
        childDept:childDept,
        childDeptCodes:childDeptCodes
    };
    var sql = util.makeSql(global.sqlMaps.onJobChild.analyOnjobAge, data);
    var content = null;
    if (childDeptCodes === "") {//缓存SQL
        content = sql;
    } else {
        content = level + parentDeptCodes + childDeptCodes + queryDate + op + "analyChildDeptOnJobUserCache";
    }
    content = "analyOnjobAge2~" + common.decode2Hash(content);
    var keys = [
        {
            oldKey: "SUM",
            newKey: "count"
        }
    ];
    common.getHANAData(content, sql, Response, keys, arg, "onJobChild", "age");
}

//在职人员年龄分析分页查询
function analyOnjobAgeByPage(arg, Response) {
    var childLevel = "0" + (parseInt(level) + 1);
    var parentDept = "DEPT" + level;
    var childDept = "DEPT" + childLevel;
    var parentDeptCodes = common.addSingleQuotationMarks(arg.parentDeptCodes);
    var childDeptCodes = common.addSingleQuotationMarks(arg.childDeptCodes);
    var op = arg.op;

    var ageId = arg.ageId;

    var pageSize = arg.pageSize || 15;
    var pageNumber = arg.pageNumber || 1;
    var offset = (pageNumber-1) * pageSize;

    var data = {
        userId:userId,
        queryDate:queryDate,
        parentDept:parentDept,
        parentDeptCodes:parentDeptCodes,
        childDept:childDept,
        childDeptCodes:childDeptCodes,
        ageId:ageId,
        pageSize:pageSize,
        offset:offset        
    };
    var sql = util.makeSql(global.sqlMaps.onJobChild.analyOnjobAgeByPage, data);
    var content = "analyOnjobAgeByPage~" + common.decode2Hash(sql);
    var keys = [
        {
            oldKey: "SUM",
            newKey: "count"
        }
    ];
    common.getHANAData(content, sql, Response, keys, arg, "onJobChild", "ageByPage");
}

//在职人员技能分析
function analyOnjobTecAndDuty(arg, Response) {
    var childLevel = "0" + (parseInt(level) + 1);
    var parentDept = "DEPT" + level;
    var childDept = "DEPT" + childLevel;
    var parentDeptCodes = common.addSingleQuotationMarks(arg.parentDeptCodes);
    var childDeptCodes = common.addSingleQuotationMarks(arg.childDeptCodes);
    var op = arg.op;

    var data = {
        userId:userId,
        queryDate:queryDate,
        parentDept:parentDept,
        parentDeptCodes:parentDeptCodes,
        childDept:childDept,
        childDeptCodes:childDeptCodes
    };
    var sql = util.makeSql(global.sqlMaps.onJobChild.analyOnjobTecAndDuty, data);
    var content = null;
    if (childDeptCodes === "") {//缓存SQL
        content = sql;
    } else {
        content = level + parentDeptCodes + childDeptCodes + queryDate + op + "analyChildDeptOnJobUserCache";
    }
    content = "analyOnjobTecAndDuty2~" + common.decode2Hash(content);
    var keys = [
        {
            oldKey: "SUM",
            newKey: "count"
        }
    ];
    common.getHANAData(content, sql, Response, keys, arg, "onJobChild", "tecAndDuty");
}

//在职人员技能分析分页查询
function analyOnjobTecAndDutyByPage(arg, Response) {
    var childLevel = "0" + (parseInt(level) + 1);
    var parentDept = "DEPT" + level;
    var childDept = "DEPT" + childLevel;
    var parentDeptCodes = common.addSingleQuotationMarks(arg.parentDeptCodes);
    var childDeptCodes = common.addSingleQuotationMarks(arg.childDeptCodes);
    var op = arg.op;


    var tzj = arg.tzj;

    var pageSize = arg.pageSize || 15;
    var pageNumber = arg.pageNumber || 1;
    var offset = (pageNumber-1) * pageSize;

    var data = {
        userId:userId,
        queryDate:queryDate,
        parentDept:parentDept,
        parentDeptCodes:parentDeptCodes,
        childDept:childDept,
        childDeptCodes:childDeptCodes,
        tzj:tzj,
        pageSize:pageSize,
        offset:offset        
    };
    var sql = util.makeSql(global.sqlMaps.onJobChild.analyOnjobTecAndDutyByPage, data);
    var content = "analyOnjobTecAndDutyByPage~" + common.decode2Hash(sql);
    var keys = [
        {
            oldKey: "SUM",
            newKey: "count"
        }
    ];
    common.getHANAData(content, sql, Response, keys, arg, "onJobChild", "tecAndDutyByPage");
}


exports.Runner = run;


                                

    

