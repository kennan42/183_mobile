var MEAP=require("meap");

function run(Param, Robot, Request, Response, IF)
{
    arg = JSON.parse(Param.body.toString());
    Response.setHeader("Content-Type", "text/json;charset=utf8");
    var userId = arg.userId;
    if (userId.length == 7) {
        userId = "0" + userId;
    }
    var jdbc = new ( require('jdbc') );
    jdbc.initialize(global.hanaConfig, function(err, res) {
        jdbc.open(function(err, conn) {
            if (!err) {
                var sql = " SELECT  \"DEPT01\", \"DEPTN01\", \"DEPT02\", \"DEPTN02\", \"DEPT03\", \"DEPTN03\", \"DEPT04\", \"DEPTN04\", \"DEPT05\", \"DEPTN05\", \"DEPT06\", \"DEPTN06\""
                        + " FROM \"_SYS_BIC\".\"cttqdc.metadata.erp.hr.basedata/CA_EMPLOYEE_AUTH_DEPT\" "
                        + " ('PLACEHOLDER' = ('$$uid$$', ':userId'), 'PLACEHOLDER' = ('$$begda$$', ':startDate'), 'PLACEHOLDER' = ('$$endda$$', ':endDate'))"
                        + " WHERE  dept02 not in ('00000020','00000021','00000022','00000023','00000024')";
				var currentDate = getCurrentDate();
				sql = sql.replace(":startDate",currentDate).replace(":endDate",currentDate).replace(":userId",userId);
				console.log(sql);
                jdbc.executeQuery(sql, function(err, rows) {
                    jdbc.close(function(err){});
                    var dept02Arr = []; //公司
                    var dept03Arr = [];//一级机构
                    var dept04Arr = [];//二级机构
                    var dept05Arr = [];//三级机构 
                    var dept06Arr = [];//四级机构
                    for (var i in rows) {
                        var item = rows[i];
                        var dept02Code = item.DEPT02;
                        var dept02Name = item.DEPTN02;
                        var dept03Code = item.DEPT03;
                        var dept03Name = item.DEPTN03;
                        var dept04Code = item.DEPT04;
                        var dept04Name = item.DEPTN04;
                        var dept05Code = item.DEPT05;
                        var dept05Name = item.DEPTN05;
                        var dept06Code = item.DEPT06;
                        var dept06Name = item.DEPTN06;
                            dept02Arr.push({
                                "deptCode" : dept02Code,
                                "deptName" : dept02Name
                            });
                            if(dept03Code != dept02Code){
                                dept03Arr.push({
                                "deptCode" : dept03Code,
                                "deptName" : dept03Name,
                                "parentDeptCode" : dept02Code
                                });
                            }
                            if(dept04Code != dept03Code){
                                dept04Arr.push({
                                "deptCode" : dept04Code,
                                "deptName" : dept04Name,
                                "parentDeptCode" : dept03Code
                                });
                            }
                            if(dept05Code != dept04Code){
                                dept05Arr.push({
                                "deptCode" : dept05Code,
                                "deptName" : dept05Name,
                                "parentDeptCode" : dept04Code
                                });
                            }
                            if(dept06Code != dept05Code){
                                dept06Arr.push({
                                "deptCode" : dept06Code,
                                "deptName" : dept06Name,
                                "parentDeptCode" : dept05Code
                             });
                            }
                            
                    }
                     var newDept02Arr = uniqueArray(dept02Arr);
                     var newDept03Arr = uniqueArray(dept03Arr);
                     var newDept04Arr = uniqueArray(dept04Arr);
                     var newDept05Arr = uniqueArray(dept05Arr);
                     var newDept06Arr = uniqueArray(dept06Arr);
                    Response.end(JSON.stringify({
                        "status" : "0",
                        "data" : {
                            "dept02Arr" : newDept02Arr,
                            "dept03Arr" : newDept03Arr,
                            "dept04Arr" : newDept04Arr,
                            "dept05Arr" : newDept05Arr,
                            "dept06Arr" : newDept06Arr
                        }
                    }));
                });
            }
        });
    });
}

/**
 * 判断数组arr中是否存在某个对象key的值为val
 * @param key
 * @param val
 * @param arr
 * @return true存在   false不存在
 * */
function inArray(key, val, arr) {
    for (var i in arr) {
        var item = arr[i];
        if (item[key] == val) {
            return true;
        }
    }
    return false;
}

//数组去重
function uniqueArray(arr){
    var res = [];
    var json = {};
    for(var i = 0; i < arr.length; i++){
        if(!json[arr[i].deptCode]){
            res.push(arr[i]);
            json[arr[i].deptCode] = 1;
        }
    }
    return res;
}

/**
 * 计算当前日期，返回格式:yyyyMMdd
 * */
function getCurrentDate(){
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    if(month < 10){
        month = '0' + month;
    }
    var currentDate = date.getDate();
    if(currentDate < 10){
        currentDate = '0' + currentDate;
    }
    var dateStr =  "" + year + month + currentDate;
    return dateStr;
}

exports.Runner = run;


                                

	

