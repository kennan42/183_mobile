var MEAP = require("meap");
var async = require("async");
var REDIS = require("meap_redis");
var common = require("../common.js");

/**
 * 人员异动分析，首先从redis里查询，如果redis不存在，则从hana查询，并缓存到redis
 * */
var userId = null;
function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type", "text/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    userId = arg.userId;
    if (userId.length == 7) {
        userId = "0" + userId;
    }
    var op = arg.op;
    switch (op) {
        case "analyGrowRateByDept":
            analyGrowRateByDept(arg, Response);
            break;
        case "analyGrowRateByMonth":
            analyGrowRateByMonth(arg, Response);
            break;
        case "analyGrowDetail":
            analyGrowDetail(arg, Response);
            break;

        case "analyFloatRateByDept":
            analyFloatRateByDept(arg, Response);
            break;
        case "analyFloatRateByMonth":
            analyFloatRateByMonth(arg, Response);
            break;
        case "analyFloatDetail":
            analyFloatDetail(arg, Response);
            break;
        default:
            Response.end(JSON.stringify({
                "status": "-1",
                "msg": "参数传递错误"
            }));
    }
}

//按部门分析员工增长率
function analyGrowRateByDept(arg, Response) {
    var startDate = arg.startDate;
    var endDate = arg.endDate;
    var parentDept = "DEPT0" + parseInt(arg.level);
    var parentDeptCodes = arg.parentDeptCodes;
    var childDeptCodes = common.addSingleQuotationMarks(arg.childDeptCodes);
    var op = arg.op;
    var level = arg.level;
    var childLevel = "0" + (parseInt(level) + 1);
    var childDept = "DEPT" + childLevel;
    var childDeptN = "DEPTN" + childLevel;
    var childDeptC = "DEPTC" + childLevel;

    var sql = " SELECT \":childDeptCode\",\":childDeptName\",sum(\"RUZHI_NUM\") AS \"RUZHI_NUM\" , "
        + " sum(\"DIAORU_NUM\") AS \"DIAORU_NUM\", sum(\"ZAIZHI_NUM\") AS \"ZAIZHI_NUM\" "
        + " FROM \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.changejob/CA_EMP_CHANGEJOB_GROW_DEPT\" "
        + " ('PLACEHOLDER' = ('$$begda$$', ':startDate'), 'PLACEHOLDER' = ('$$userid$$', ':userId'), "
        + " 'PLACEHOLDER' = ('$$endda$$', ':endDate')) "
        + " WHERE \":childDeptCode\" <> \":childDeptC\" "
        + " AND \":parentDept\" IN (:parentDeptCodes) "
        + " AND \":childDeptCode\" NOT IN (:parentDeptCodes) ";
    if (childDeptCodes != "") {
        sql += " AND \":childDeptCode\" IN (:childDeptCodes) ";
    }
    sql += " GROUP BY \":childDeptCode\",\":childDeptName\" ";
    sql = sql.replace(/:childDeptCode/g, childDept)
        .replace(/:childDeptName/g, childDeptN)
        .replace(":startDate", startDate)
        .replace(":userId", userId)
        .replace(":endDate", endDate)
        .replace(":childDeptC", childDeptC)
        .replace(":parentDept", parentDept)
        .replace(/:parentDeptCodes/g, parentDeptCodes)
        .replace(":childDeptCodes", childDeptCodes);
    var content = sql;
    if (childDeptCodes != "") {
        content = startDate + endDate + parentDeptCodes + childDeptCodes + level + op + "analyChildDeptMoveUseCache";
    }
    content = "analyGrowRateByDept2~" + common.decode2Hash(content);
    var keys = [
        {
            oldKey: "UNION_COL21",
            newKey: "RUZHI_NUM"
        }, {
            oldKey: "UNION_COL22",
            newKey: "DIAORU_NUM"
        }, {
            oldKey: "UNION_COL23",
            newKey: "ZAIZHI_NUM"
        }
    ];
    common.getHANAData(content, sql, Response, keys, arg, "increaseChild", "department");
}

//按部门分析员工流动率
function analyFloatRateByDept(arg, Response) {
    var startDate = arg.startDate;
    var endDate = arg.endDate;
    var parentDept = "DEPT0" + parseInt(arg.level);
    var parentDeptCodes = arg.parentDeptCodes;
    var childDeptCodes = common.addSingleQuotationMarks(arg.childDeptCodes);
    var op = arg.op;
    var level = arg.level;
    var childLevel = "0" + (parseInt(level) + 1);
    var childDept = "DEPT" + childLevel;
    var childDeptN = "DEPTN" + childLevel;
    var childDeptC = "DEPTC" + childLevel;

    var sql = " SELECT \":childDeptCode\",\":childDeptName\",sum(\"LIZHI_NUM\") AS \"LIZHI_NUM\", "
        + " sum(\"DIAOCHU_NUM\") AS \"DIAOCHU_NUM\",sum(\"ZAIZHI_NUM\") AS \"ZAIZHI_NUM\" "
        + " FROM  \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.changejob/CA_EMP_CHANGEJOB_FLOW_DEPT\" "
        + " ('PLACEHOLDER' = ('$$begda$$', ':startDate'), 'PLACEHOLDER' = ('$$userid$$', ':userId'), "
        + " 'PLACEHOLDER' = ('$$endda$$', ':endDate'))  WHERE \":childDeptCode\" <> \":childDeptC\" "
        + " AND \":parentDept\" IN (:parentDeptCodes)"
        + " AND \":childDeptCode\" NOT IN (:parentDeptCodes) ";
    if (childDeptCodes != "") {
        sql += " AND \":childDeptCode\" IN (:childDeptCodes) ";
    }
    sql += " GROUP BY \":childDeptCode\",\":childDeptName\" ORDER BY \"LIZHI_NUM\" desc ";
    sql = sql.replace(/:childDeptCode/g, childDept)
        .replace(/:childDeptName/g, childDeptN)
        .replace(":childDeptC", childDeptC)
        .replace(":startDate", startDate)
        .replace(":userId", userId)
        .replace(":endDate", endDate)
        .replace(":parentDept", parentDept)
        .replace(":childDeptCodes", childDeptCodes)
        .replace(/:parentDeptCodes/g, parentDeptCodes);
    var content = sql;
    if (childDeptCodes != "") {
        content = startDate + endDate + parentDeptCodes + childDeptCodes + level + op + "analyChildDeptMoveUseCache";
    }
    content = "analyFloatRateByDept2~" + common.decode2Hash(content);
    var keys = [
        {
            oldKey: "UNION_COL21",
            newKey: "LIZHI_NUM"
        }, {
            oldKey: "UNION_COL22",
            newKey: "DIAOCHU_NUM"
        }, {
            oldKey: "UNION_COL23",
            newKey: "ZAIZHI_NUM"
        }
    ];
    common.getHANAData(content, sql, Response, keys, arg, "floatChild", "department");
}

//按月份统计员工增长率
function analyGrowRateByMonth(arg, Response) {
    var startDate = arg.startDate;
    var endDate = arg.endDate;
    var parentDept = "DEPT0" + parseInt(arg.level);
    var parentDeptCodes = arg.parentDeptCodes;
    var childDeptCodes = common.addSingleQuotationMarks(arg.childDeptCodes);
    var op = arg.op;
    var level = arg.level;
    var childLevel = "0" + (parseInt(level) + 1);
    var childDept = "DEPT" + childLevel;
    var childDeptN = "DEPTN" + childLevel;
    var childDeptC = "DEPTC" + childLevel;

    var sql = " SELECT \"AMONTH\",sum(\"RUZHI_NUM\") AS \"RUZHI_NUM\", "
        + " sum(\"DIAORU_NUM\") AS \"DIAORU_NUM\", sum(\"ZAIZHI_NUM\") AS \"ZAIZHI_NUM\" "
        + " FROM  \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.changejob/CA_EMP_CHANGEJOB_GROW_MONTH\" "
        + " ('PLACEHOLDER' = ('$$begda$$', ':startDate'), 'PLACEHOLDER' = ('$$userid$$', ':userId'), "
        + " 'PLACEHOLDER' = ('$$endda$$', ':endDate')) "
        + " WHERE \":childDeptCode\" <> \":childDeptC\" "
        + " AND \":parentDept\" IN (:parentDeptCodes)"
        + " AND \":childDeptCode\" NOT IN (:parentDeptCodes) ";
    if (childDeptCodes != "") {
        sql += " AND \":childDeptCode\" IN (:childDeptCodes) ";
    }
    sql += " GROUP BY \"AMONTH\" ORDER BY \"AMONTH\" desc";
    sql = sql.replace(":startDate", startDate)
        .replace(":userId", userId)
        .replace(":endDate", endDate)
        .replace(":childDeptCodes", childDeptCodes)
        .replace(/:childDeptCode/g, childDept)
        .replace(":childDeptC", childDeptC)
        .replace(/:parentDeptCodes/g, parentDeptCodes)
        .replace(":parentDept", parentDept);
    var content = sql;
    if (childDeptCodes != "") {
        content = startDate + endDate + parentDeptCodes + childDeptCodes + level + op + "analyChildDeptMoveUseCache";
    }
    content = "analyGrowRateByMonth2~" + common.decode2Hash(content);
    var keys = [
        {
            oldKey: "UNION_COL15",
            newKey: "RUZHI_NUM"
        }, {
            oldKey: "UNION_COL16",
            newKey: "DIAORU_NUM"
        }, {
            oldKey: "UNION_COL17",
            newKey: "ZAIZHI_NUM"
        }
    ];
    common.getHANAData(content, sql, Response, keys, arg, "increaseChild", "month");
}

//按月份统计员工流动率
function analyFloatRateByMonth(arg, Response) {
    var startDate = arg.startDate;
    var endDate = arg.endDate;
    var parentDept = "DEPT0" + parseInt(arg.level);
    var parentDeptCodes = arg.parentDeptCodes;
    var childDeptCodes = common.addSingleQuotationMarks(arg.childDeptCodes);
    var op = arg.op;
    var level = arg.level;
    var childLevel = "0" + (parseInt(level) + 1);
    var childDept = "DEPT" + childLevel;
    var childDeptN = "DEPTN" + childLevel;
    var childDeptC = "DEPTC" + childLevel;

    var sql = " SELECT \"AMONTH\",sum(\"LIZHI_NUM\") AS \"LIZHI_NUM\", "
        + " sum(\"DIAOCHU_NUM\") AS \"DIAOCHU_NUM\", sum(\"ZAIZHI_NUM\") AS \"ZAIZHI_NUM\" "
        + " FROM  \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.changejob/CA_EMP_CHANGEJOB_FLOW_MONTH\" "
        + " ('PLACEHOLDER' = ('$$begda$$', ':startDate'), 'PLACEHOLDER' = ('$$userid$$', ':userId'), "
        + " 'PLACEHOLDER' = ('$$endda$$', ':endDate')) "
        + " WHERE  \":childDeptCode\" <> \":childDeptC\" "
        + " AND \":parentDept\" IN (:parentDeptCodes) "
        + " AND \":childDeptCode\" NOT IN (:parentDeptCodes) ";
    if (childDeptCodes != "") {
        sql += " AND \":childDeptCode\" IN (:childDeptCodes) ";
    }
    sql += " GROUP BY \"AMONTH\" ORDER BY \"AMONTH\" desc";
    sql = sql.replace(":startDate", startDate)
        .replace(":userId", userId)
        .replace(":endDate", endDate)
        .replace(":childDeptCodes", childDeptCodes)
        .replace(/:childDeptCode/g, childDept)
        .replace(":childDeptC", childDeptC)
        .replace(/:parentDeptCodes/g, parentDeptCodes)
        .replace(":parentDept", parentDept);
    var content = sql;
    if (childDeptCodes != "") {
        content = startDate + endDate + parentDeptCodes + childDeptCodes + level + op + "analyChildDeptMoveUseCache";
    }
    content = "analyFloatRateByMonth2~" + common.decode2Hash(content);
    var keys = [
        {
            oldKey: "UNION_COL15",
            newKey: "LIZHI_NUM"
        }, {
            oldKey: "UNION_COL16",
            newKey: "DIAOCHU_NUM"
        }, {
            oldKey: "UNION_COL17",
            newKey: "ZAIZHI_NUM"
        }
    ];
    common.getHANAData(content, sql, Response, keys, arg, "floatChild", "month");
}

//统计员工增长明细
function analyGrowDetail(arg, Response) {
    var startDate = arg.startDate;
    var endDate = arg.endDate;
    var month = arg.endDate.substr(0, 6);
    var parentDept = "DEPT0" + parseInt(arg.level);
    var parentDeptCodes = arg.parentDeptCodes;
    var childDeptCodes = common.addSingleQuotationMarks(arg.childDeptCodes);
    var op = arg.op;
    var level = arg.level;
    var childLevel = "0" + (parseInt(level) + 1);
    var childDept = "DEPT" + childLevel;
    var childDeptN = "DEPTN" + childLevel;
    var childDeptC = "DEPTC" + childLevel;

    var sql = " SELECT \"AMONTH\",\":dept\",\":deptN\",\"PERNR\",\"PNAME\",\"MTYPET\" "
        + " FROM  \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.changejob/CA_EMP_CHANGEJOB_GROW_PERSON\" "
        + " ('PLACEHOLDER' = ('$$begda$$', ':startDate'), 'PLACEHOLDER' = ('$$userid$$', ':userId'), "
        + " 'PLACEHOLDER' = ('$$endda$$', ':endDate'))"
        + " WHERE  \":childDeptCode\" <> \":childDeptC\" "
        + " AND \":parentDept\" IN (:parentDeptCodes) "
        + " AND \":childDeptCode\" NOT IN (:parentDeptCodes) ";
    if (childDeptCodes != "") {
        sql += " AND \":childDept\" IN (:childDeptCodes) ";
    }
    sql += " AND \"AMONTH\" IN (:month) ";
    sql = sql.replace(":startDate", startDate)
        .replace(":endDate", endDate)
        .replace(":userId", userId)
        .replace(":dept", childDept)
        .replace(":deptN", childDeptN)
        .replace(":childDeptCodes", childDeptCodes)
        .replace(/:childDeptCode/g, childDept)
        .replace(":childDeptC", childDeptC)
        .replace(/:childDept/g, childDept)
        .replace(/:parentDeptCodes/g, parentDeptCodes)
        .replace(":parentDept", parentDept)
        .replace(":month", month);
    var content = sql;
    if (childDeptCodes != "") {
        content = startDate + endDate + parentDeptCodes + childDeptCodes + level + op + month + "analyChildDeptMoveUseCache";
    }
    content = "analyGrowDetail2~" + common.decode2Hash(content);
    var keys = [
        {
            oldKey: "UNION_COL15",
            newKey: "LIZHI_NUM"
        }, {
            oldKey: "UNION_COL16",
            newKey: "DIAOCHU_NUM"
        }, {
            oldKey: "UNION_COL17",
            newKey: "ZAIZHI_NUM"
        }
    ];
    common.getHANAData(content, sql, Response, keys, arg, "increaseChild", "monthDetails");
}

//统计员工流动明细
function analyFloatDetail(arg, Response) {
    var startDate = arg.startDate;
    var endDate = arg.endDate;
    var month = arg.endDate.substr(0, 6);
    var parentDept = "DEPT0" + parseInt(arg.level);
    var parentDeptCodes = arg.parentDeptCodes;
    var childDeptCodes = common.addSingleQuotationMarks(arg.childDeptCodes);
    var op = arg.op;
    var level = arg.level;
    var childLevel = "0" + (parseInt(level) + 1);
    var childDept = "DEPT" + childLevel;
    var childDeptN = "DEPTN" + childLevel;
    var childDeptC = "DEPTC" + childLevel;

    var sql = " SELECT \"AMONTH\",\":dept\",\":deptN\",\"PERNR\",\"PNAME\",\"MTYPET\" "
        + " FROM  \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.changejob/CA_EMP_CHANGEJOB_FLOW_PERSON\" "
        + " ('PLACEHOLDER' = ('$$begda$$', ':startDate'), 'PLACEHOLDER' = ('$$userid$$', ':userId'), "
        + " 'PLACEHOLDER' = ('$$endda$$', ':endDate'))  "
        + " WHERE  \":childDeptCode\" <> \":childDeptC\" "
        + " AND \":parentDept\" IN (:parentDeptCodes) "
        + " AND \":childDeptCode\" NOT IN (:parentDeptCodes) ";
    if (childDeptCodes != "") {
        sql += " AND \":childDept\" IN (:childDeptCodes) ";
    }
    sql += " AND \"AMONTH\" IN (:month) ";

    sql = sql.replace(":startDate", startDate)
        .replace(":endDate", endDate)
        .replace(":userId", userId)
        .replace(":dept", childDept)
        .replace(":deptN", childDeptN)
        .replace(":childDeptCodes", childDeptCodes)
        .replace(/:childDeptCode/g, childDept)
        .replace(":childDeptC", childDeptC)
        .replace(/:childDept/g, childDept)
        .replace(/:parentDeptCodes/g, parentDeptCodes)
        .replace(":parentDept", parentDept)
        .replace(":month", month);
    var content = sql;
    if (childDeptCodes != "") {
        content = startDate + endDate + parentDeptCodes + childDeptCodes + level + op + month + "analyChildDeptMoveUseCache";
    }
    content = "analyMoveDetail2~" + common.decode2Hash(content);
    var keys = [
        {
            oldKey: "UNION_COL15",
            newKey: "LIZHI_NUM"
        }, {
            oldKey: "UNION_COL16",
            newKey: "DIAOCHU_NUM"
        }, {
            oldKey: "UNION_COL17",
            newKey: "ZAIZHI_NUM"
        }
    ];
    common.getHANAData(content, sql, Response, keys, arg, "floatChild", "monthDetails");
}

exports.Runner = run;
