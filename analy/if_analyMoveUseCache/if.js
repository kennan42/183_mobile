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
        //以下3个 case 为人员增长率
        case "analyGrowRateByDept":
            analyGrowRateByDept(arg, Response);
            break;
        case "analyGrowRateByMonth":
            analyGrowRateByMonth(arg, Response);
            break;
        case "analyGrowDetail":
            analyGrowDetail(arg, Response);
            break;
        //以下3个 case 为人员流动率
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
    var level = arg.level;
    var deptCodes = common.addSingleQuotationMarks(arg.deptCodes);
    var op = arg.op;
    var dept = "DEPT" + level;
    var deptN = "DEPTN" + level;
    var deptC = "DEPTC" + level;
    var sql = " SELECT \":DEPT\",\":DEPTN\",sum(\"RUZHI_NUM\") AS \"RUZHI_NUM\", "
        + " sum(\"DIAORU_NUM\") AS \"DIAORU_NUM\",  sum(\"ZAIZHI_NUM\") AS \"ZAIZHI_NUM\" "
        + " FROM \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.changejob/CA_EMP_CHANGEJOB_GROW_DEPT\" "
        + " ('PLACEHOLDER' = ('$$begda$$', ':startDate'), 'PLACEHOLDER' = ('$$userid$$', ':userId'), "
        + " 'PLACEHOLDER' = ('$$endda$$', ':endDate')) WHERE \":DEPT\" <> \":DEPTC\" ";
    if (deptCodes != "") {
        sql += " AND \":DEPT\" IN (:deptCodes) ";
    }
    sql += " GROUP BY \":DEPT\",\":DEPTN\" ";
    sql = sql.replace(/:DEPTN/g, deptN)
        .replace(":DEPTC", deptC)
        .replace(/:DEPT/g, dept)
        .replace(":deptCodes", deptCodes)
        .replace(":startDate", startDate)
        .replace(":endDate", endDate)
        .replace(":userId", userId);
    var content = sql;
    if (deptCodes != "") {
        content = startDate + endDate + level + deptCodes + dept + deptN + deptC + op + "analyMoveUseCache";
    }
    content = "analyGrowRateByDept~" + common.decode2Hash(content);
    //待替换的key值
    var keys = [
        {
            oldKey: "UNION_COL21",
            newKey: "RUZHI_NUM"
        }, {
            oldKey: "UNION_COL22",
            newKey: "DIAORU_NUM"
        }, {
            oldKey: "UNION_COL23",//UNION_COL23
            newKey: "ZAIZHI_NUM"
        }
    ];
    common.getHANAData(content, sql, Response, keys, arg, "increase", "department");
}

//按部门分析员工流动率
function analyFloatRateByDept(arg, Response) {
    var startDate = arg.startDate;
    var endDate = arg.endDate;
    var level = arg.level;
    var deptCodes = common.addSingleQuotationMarks(arg.deptCodes);
    var op = arg.op;
    var dept = "DEPT" + level;
    var deptN = "DEPTN" + level;
    var deptC = "DEPTC" + level;

    var sql = " SELECT \":DEPT\",\":DEPTN\",sum(\"LIZHI_NUM\") AS \"LIZHI_NUM\", "
        + " sum(\"DIAOCHU_NUM\") AS \"DIAOCHU_NUM\",sum(\"ZAIZHI_NUM\") AS \"ZAIZHI_NUM\" "
        + " FROM  \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.changejob/CA_EMP_CHANGEJOB_FLOW_DEPT\" "
        + " ('PLACEHOLDER' = ('$$begda$$', ':startDate'), 'PLACEHOLDER' = ('$$userid$$', ':userId'), "
        + " 'PLACEHOLDER' = ('$$endda$$', ':endDate')) "
        + "WHERE \":DEPT\" <> \":DEPTC\" ";
    if (deptCodes != "") {
        sql += " AND \":DEPT\" IN (:deptCodes) ";
    }
    sql += " GROUP BY \":DEPT\",\":DEPTN\" ";
    sql = sql.replace(/:DEPTN/g, deptN)
        .replace(":DEPTC", deptC)
        .replace(/:DEPT/g, dept)
        .replace(":deptCodes", deptCodes)
        .replace(":startDate", startDate)
        .replace(":endDate", endDate)
        .replace(":userId", userId);
    var content = sql;
    if (deptCodes != "") {
        content = startDate + endDate + level + deptCodes + dept + deptN + deptC + op + "analyMoveUseCache";
    }
    content = "analyFloatRate1~" + common.decode2Hash(content);
    var keys = [
        {
            oldKey: "UNION_COL21",
            newKey: "LIZHI_NUM"
        }, {
            oldKey: "UNION_COL22",
            newKey: "DIAOCHU_NUM"
        }, {
            oldKey: "UNION_COL23",//UNION_COL23
            newKey: "ZAIZHI_NUM"
        }
    ];
    common.getHANAData(content, sql, Response, keys, arg, "float", "department");
}

//按月份统计员工增长率
function analyGrowRateByMonth(arg, Response) {
    var startDate = arg.startDate;
    var endDate = arg.endDate;
    var level = arg.level;
    var deptCodes = common.addSingleQuotationMarks(arg.deptCodes);
    var op = arg.op;
    var dept = "DEPT" + level;
    var deptN = "DEPTN" + level;
    var deptC = "DEPTC" + level;

    var sql = " SELECT \"AMONTH\",sum(\"RUZHI_NUM\") AS \"RUZHI_NUM\" ,sum(\"DIAORU_NUM\") AS \"DIAORU_NUM\" ,"
        + " sum(\"ZAIZHI_NUM\") AS \"ZAIZHI_NUM\" "
        + " FROM  \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.changejob/CA_EMP_CHANGEJOB_GROW_MONTH\" "
        + " ('PLACEHOLDER' = ('$$begda$$', ':startDate'), 'PLACEHOLDER' = ('$$userid$$', ':userId'), "
        + " 'PLACEHOLDER' = ('$$endda$$', ':endDate')) WHERE \":dept\" <> \":deptC\" ";
    if (deptCodes != "") {
        sql += " AND \":dept\" IN (:deptCodes) ";
    }
    sql += " GROUP BY \"AMONTH\" order by \"AMONTH\" desc";
    sql = sql.replace(":startDate", startDate)
        .replace(":userId", userId)
        .replace(":endDate", endDate)
        .replace(":deptCodes", deptCodes)
        .replace(":deptC", deptC)
        .replace(/:dept/g, dept);
    var content = sql;
    if (deptCodes != "") {
        content = startDate + endDate + level + deptCodes + dept + deptN + deptC + op + "analyMoveUseCache";
    }
    content = "analyGrowRateByMonth1~" + common.decode2Hash(content);
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
    common.getHANAData(content, sql, Response, keys, arg, "increase", "month");
}

//按月份统计员工流动率
function analyFloatRateByMonth(arg, Response) {
    var startDate = arg.startDate;
    var endDate = arg.endDate;
    var level = arg.level;
    var deptCodes = common.addSingleQuotationMarks(arg.deptCodes);
    var op = arg.op;
    var dept = "DEPT" + level;
    var deptN = "DEPTN" + level;
    var deptC = "DEPTC" + level;

    var sql = " SELECT \"AMONTH\",sum(\"LIZHI_NUM\") AS \"LIZHI_NUM\" ,sum(\"DIAOCHU_NUM\") AS \"DIAOCHU_NUM\" ,"
        + " sum(\"ZAIZHI_NUM\") AS \"ZAIZHI_NUM\" "
        + " FROM  \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.changejob/CA_EMP_CHANGEJOB_FLOW_MONTH\" "
        + " ('PLACEHOLDER' = ('$$begda$$', ':startDate'), 'PLACEHOLDER' = ('$$userid$$', ':userId'), "
        + " 'PLACEHOLDER' = ('$$endda$$', ':endDate'))"
        + " WHERE \":dept\" <> \":deptC\" ";
    if (deptCodes != "") {
        sql += " AND \":dept\" IN (:deptCodes) ";
    }
    sql += " GROUP BY \"AMONTH\" order by \"AMONTH\" desc";
    sql = sql.replace(":startDate", startDate)
        .replace(":userId", userId)
        .replace(":endDate", endDate)
        .replace(":deptCodes", deptCodes)
        .replace(":deptC", deptC)
        .replace(/:dept/g, dept);
    var content = sql;
    if (deptCodes != "") {
        content = startDate + endDate + level + deptCodes + dept + deptN + deptC + op + "analyMoveUseCache";
    }
    content = "analyFloatRateByMonth~" + common.decode2Hash(content);
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
    common.getHANAData(content, sql, Response, keys, arg, "float", "month");
}

//统计员工增长明细
function analyGrowDetail(arg, Response) {
    var startDate = arg.startDate;
    var endDate = arg.endDate;
    var level = arg.level;
    var deptCodes = common.addSingleQuotationMarks(arg.deptCodes);
    var month = arg.endDate.substr(0, 6);
    var op = arg.op;
    var dept = "DEPT" + level;
    var deptN = "DEPTN" + level;
    var deptC = "DEPTC" + level;

    var sql = " SELECT \"AMONTH\",\":dept\",\":deptN\",\"PERNR\",\"PNAME\",\"MTYPET\" "
        + " FROM  \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.changejob/CA_EMP_CHANGEJOB_GROW_PERSON\" "
        + " ('PLACEHOLDER' = ('$$begda$$', ':startDate'), 'PLACEHOLDER' = ('$$userid$$', ':userId'), "
        + " 'PLACEHOLDER' = ('$$endda$$', ':endDate')) "
        + " WHERE \":dept\" <> \":deptC\" ";
    if (deptCodes != "") {
        sql += " AND \":dept\" IN (" + deptCodes + ") ";
    }
    sql += " AND \"AMONTH\" IN (':month') ";
    sql = sql.replace(":deptN", deptN)
        .replace(":deptC", deptC)
        .replace(/:dept/g, dept)
        .replace(":startDate", startDate)
        .replace(":endDate", endDate)
        .replace(":userId", userId)
        .replace(":month", month);
    var content = sql;
    if (deptCodes != "") {
        content = startDate + endDate + level + deptCodes + dept + deptN + deptC + month + op + "analyMoveUseCache";
    }
    content = "analyGrowDetail1~" + common.decode2Hash(content);
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
    common.getHANAData(content, sql, Response, keys, arg, "increase", "monthDetails");
}

//统计员工流动明细
function analyFloatDetail(arg, Response) {
    var startDate = arg.startDate;
    var endDate = arg.endDate;
    var level = arg.level;
    var month = arg.endDate.substr(0, 6);
    var deptCodes = common.addSingleQuotationMarks(arg.deptCodes);
    var op = arg.op;
    var dept = "DEPT" + level;
    var deptN = "DEPTN" + level;
    var deptC = "DEPTC" + level;

    var sql = " SELECT \"AMONTH\",\":dept\",\":deptN\",\"PERNR\",\"PNAME\",\"MTYPET\" "
        + " FROM  \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.changejob/CA_EMP_CHANGEJOB_FLOW_PERSON\" "
        + " ('PLACEHOLDER' = ('$$begda$$', ':startDate'), 'PLACEHOLDER' = ('$$userid$$', ':userId'), "
        + " 'PLACEHOLDER' = ('$$endda$$', ':endDate')) "
        + " WHERE \":dept\" <> \":deptC\" ";
    if (deptCodes != "") {
        sql += " AND \":dept\" IN (" + deptCodes + ") ";
    }
    sql += " AND \"AMONTH\" IN (:month) ";
    sql = sql.replace(":deptN", deptN)
        .replace(":deptC", deptC)
        .replace(/:dept/g, dept)
        .replace(":startDate", startDate)
        .replace(":endDate", endDate)
        .replace(":userId", userId)
        .replace(":month", month);

    var content = sql;
    if (deptCodes != "") {
        content = startDate + endDate + level + deptCodes + dept + deptN + deptC + month + op + "analyMoveUseCache";
    }
    content = "analyMoveDetail1~" + common.decode2Hash(content);
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
    common.getHANAData(content, sql, Response, keys, arg, "float", "monthDetails");
}

exports.Runner = run;
