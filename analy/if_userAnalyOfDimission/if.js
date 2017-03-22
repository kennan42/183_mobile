var MEAP=require("meap");

//离职员工数量分析
var userId = null;
function run(Param, Robot, Request, Response, IF)
{
    var arg = JSON.parse(Param.body.toString());
    userId = arg.userId;
    if (userId.length == 7) {
        userId = "0" + userId;
    }
    Response.setHeader("Content-Type","text/json;charset=utf8"); 
    var op = arg.op;
    switch(op){
        case "tendencyAnaly":
        tendencyAnaly(arg,Response);
        break;
        case "typeAnaly":
        typeAnaly(arg,Response);
        break;
        case "eduAnaly":
        eduAnaly(arg,Response);
        break;
        case "silingAnaly":
        silingAnaly(arg,Response);
        break;
        default:
        Response.end(JSON.stringify({
            "status":"-1",
            "msg":"传递参数错误"
        }));
    }
}

//离职趋势分析
function tendencyAnaly(arg,Response){
    var startMonth = arg.startMonth;
    var endMonth = arg.endMonth;
    var deptCodes = arg.deptCodes;
    var level = arg.level;
    var deptCode = "DEPT" + level;
    var deptName = "DEPTN" + level;
    var jdbc = new ( require('jdbc') );
    jdbc.initialize(global.hanaConfig, function(err, res) {
        jdbc.open(function(err, conn) {
            var sql = " SELECT \":deptCode\",\":deptName\",sum(\"LZ_NUM\") AS \"LZ_NUM\" "
                    + " FROM  \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.leavejob/CA_EMP_LJ_BYMONTH_STAT\" "
                    + " ('PLACEHOLDER' = ('$$month_to$$', ':endMonth'),'PLACEHOLDER' = ('$$userid$$', ':userId'), "
                    + " 'PLACEHOLDER' = ('$$month_from$$', ':startMonth')) "
                    + " WHERE 1= 1 "
            if(deptCodes != ""){
                sql += " AND \":deptCode\" in (:deptCodes)  ";
            }
            sql += " GROUP BY \":deptCode\",\":deptName\" order by \"LZ_NUM\" desc ";
            sql = sql.replace(":startMonth",startMonth).replace(":userId",userId)
                .replace(":endMonth",endMonth).replace(":deptCode",deptCode).replace(":deptCodes",deptCodes)
                .replace(":deptCode",deptCode).replace(":deptName",deptName)
                .replace(":deptCode",deptCode).replace(":deptName",deptName);
            console.log(sql);
            jdbc.executeQuery(sql, function(err, rows) {
                jdbc.close(function(err) {});
                var rs  = handleResult(rows);
                Response.end(JSON.stringify({
                    "status" : "0",
                    "data" : rs
                }));
            });
        });
    });
}

//离职类型分析
function typeAnaly(arg,Response){
    var startMonth = arg.startMonth;
    var endMonth = arg.endMonth;
    var deptCodes = arg.deptCodes;
    var level = arg.level;
    var deptCode = "DEPT" + level;
    var deptName = "DEPTN" + level;
    var jdbc = new ( require('jdbc') );
    jdbc.initialize(global.hanaConfig, function(err, res) {
        jdbc.open(function(err, conn) {
            var sql = " SELECT \"REASONC\",\"REASONT\",sum(\"LZ_NUM\") AS \"LZ_NUM\" "
                    + " FROM  \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.leavejob/CA_EMP_LJ_BYTYPE_SAT\" "
                    + " ('PLACEHOLDER' = ('$$month_to$$', ':endMonth'), 'PLACEHOLDER' = ('$$userid$$', ':userId'), "
                    + " 'PLACEHOLDER' = ('$$month_from$$', ':startMonth')) "
                    + " WHERE 1 = 1 ";
            if(deptCodes != ""){
                sql += " and \":deptCode\" in (:deptCodes)  ";
            }
            sql += " GROUP BY \"REASONC\",\"REASONT\" order by \"LZ_NUM\" desc ";
            sql = sql.replace(":startMonth",startMonth).replace(":userId",userId)
                .replace(":endMonth",endMonth).replace(":deptCode",deptCode).replace(":deptCodes",deptCodes)
            console.log(sql);
            jdbc.executeQuery(sql, function(err, rows) {
                jdbc.close(function(err) {});
                var rs  = handleResult(rows);
                Response.end(JSON.stringify({
                    "status" : "0",
                    "data" : rs
                }));
            });
        });
    });
}

//离职学历分析
function eduAnaly(arg,Response){
    var startMonth = arg.startMonth;
    var endMonth = arg.endMonth;
    var deptCodes = arg.deptCodes;
    var level = arg.level;
    var deptCode = "DEPT" + level;
    var deptName = "DEPTN" + level;
    var jdbc = new ( require('jdbc') );
    jdbc.initialize(global.hanaConfig, function(err, res) {
        jdbc.open(function(err, conn) {
            var sql = " SELECT \"SLART_CODE\",\"SLART_DES\",sum(\"LZ_NUM\") AS \"LZ_NUM\" "
                    + " FROM  \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.leavejob/CA_EMP_LJ_BYEDU_SAT\" "
                    + " ('PLACEHOLDER' = ('$$month_to$$', ':endMonth'), 'PLACEHOLDER' = ('$$userid$$', ':userId'), "
                    + " 'PLACEHOLDER' = ('$$month_from$$', ':startMonth')) WHERE 1 = 1 ";
            if(deptCodes != ""){
                sql += " and \":deptCode\" in (:deptCodes)  ";
            }
            sql += " GROUP BY \"SLART_CODE\",\"SLART_DES\" order by \"LZ_NUM\" desc ";        
            sql = sql.replace(":startMonth",startMonth).replace(":userId",userId)
                .replace(":endMonth",endMonth).replace(":deptCode",deptCode).replace(":deptCodes",deptCodes);
            console.log(sql);
            jdbc.executeQuery(sql, function(err, rows) {
                jdbc.close(function(err) {});
                var rs  = handleResult(rows);
                Response.end(JSON.stringify({
                    "status" : "0",
                    "data" : rs
                }));
            });
        });
    });
}

//离职司龄分析
function silingAnaly(arg,Response){
    var startMonth = arg.startMonth;
    var endMonth = arg.endMonth;
    var deptCodes = arg.deptCodes;
    var level = arg.level;
    var deptCode = "DEPT" + level;
    var deptName = "DEPTN" + level;
    var jdbc = new ( require('jdbc') );
    jdbc.initialize(global.hanaConfig, function(err, res) {
        jdbc.open(function(err, conn) {
            var sql = " SELECT \"SL_ID\", \"SL_NAME\",sum(\"LZ_NUM\") AS \"LZ_NUM\" "
                    + " FROM  \"_SYS_BIC\".\"cttqdc.subjects.erp.hr.leavejob/CA_EMP_LJ_BYSL_SAT\" "
                    + " ('PLACEHOLDER' = ('$$month_to$$', ':endMonth'), 'PLACEHOLDER' = ('$$userid$$', ':userId'), "
                    + " 'PLACEHOLDER' = ('$$month_from$$', ':startMonth')) WHERE 1 = 1 "
            if(deptCodes != ""){
                sql += " and \":deptCode\" in (:deptCodes)  ";
            }
            sql += " GROUP BY \"SL_ID\", \"SL_NAME\" order by \"LZ_NUM\" desc ";               
            sql = sql.replace(":startMonth",startMonth).replace(":userId",userId)
                .replace(":endMonth",endMonth).replace(":deptCode",deptCode).replace(":deptCodes",deptCodes);
            console.log(sql);
            jdbc.executeQuery(sql, function(err, rows) {
                jdbc.close(function(err) {});
                var rs  = handleResult(rows);
                Response.end(JSON.stringify({
                    "status" : "0",
                    "data" : rs
                }));
            });
        });
    });
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



exports.Runner = run;


                                

	

