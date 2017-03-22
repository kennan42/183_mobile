var MEAP=require("meap");

function run(Param, Robot, Request, Response, IF)
{
    var jdbc = new ( require('jdbc') );
    arg = JSON.parse(Param.body.toString());
    Response.setHeader("Content-Type", "text/json;charset=utf8");
    var userId = arg.userId;
    if (userId.length == 7) {
        userId = "0" + userId;
    }

    jdbc.initialize(global.hanaConfig, function(err, res) {
        jdbc.open(function(err, conn) {
            if (!err) {
                var sql = "SELECT \"DEPT01\", \"DEPTN01\", \"DEPT02\", \"DEPTN02\"," + " \"DEPT03\", \"DEPTN03\","
                    + " \"DEPT04\", \"DEPTN04\", \"DEPT05\", \"DEPTN05\", \"DEPT06\", \"DEPTN06\" " 
                    + "FROM \"_SYS_BIC\".\"cttqdc.metadata.erp.hr.basedata/CA_EMPLOYEE_AUTH_DEPT\" "
                    + " WHERE  dept02 <> '00000022'" + " and UID = '" + userId + "' and YEAR = :YEAR and MONTH = :MONTH limit 1 offset 0";
                var date = new Date();
                var year = date.getFullYear() + "";
                var month = date.getMonth() + 1;
                if(month < 10){
                    month = "0" + month;
                }
                month = "" + month;
                sql = sql.replace(":YEAR",year).replace(":MONTH",month);
                jdbc.executeQuery(sql, function(err, rows) {
                    jdbc.close(function(err){});
                    var flag = "0";
                    if(rows.length == 0){
                        flag = "-1";
                    }
                    Response.end(JSON.stringify({
                        "status" : "0",
                        "flag":flag
                    }));
                });
            }
        });
    });
}


exports.Runner = run;


                                

    

