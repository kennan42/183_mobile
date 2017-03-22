var MEAP=require("meap");
var async = require("async");
/**
 * 部门出差费用报销
 * zrx 2016.8.15
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param, Robot, Request, Response, IF)
{ 
    Response.setHeader("Content-Type","text/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
    var deptId  = arg.deptId ; 
    var startDate = arg.yMont_S;
    var endDate = arg.yMont_E; 
    if(deptId ==null||deptId == ''||startDate == null ||startDate ==''||endDate ==null||endDate ==''){ 
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "传递参数错误"
        }));
        return;   
    }   
    var str ="";
    if(deptId.length<8){  
        for(var i=0;i< 8-deptId.length;i++){
            str+="0"; 
        } 
    }
    deptId =str +deptId; 
    //查询出差信息列表,行程组列表,行程列表
 async.parallel([
     function(cb){
          var jdbc = new ( require('jdbc') );
        jdbc.initialize(global.hanaConfig, function(err, res) {
        var sql =  "select \"DEPTCODE\",left(\"STARTDAT\",6) as \"YMONT\",sum(\"APROAMT\") as \"TOTALAMT\" "
  + " from \"_SYS_BIC\".\"cttqdc.subjects.em.output/CA_EM_PERSON_TRAVEL_COST\" " 
  + " ('PLACEHOLDER' = ('$$P_USRID$$', '*'), "
  + " 'PLACEHOLDER' = ('$$P_DEPTID$$', ':deptId'), "  
  + " 'PLACEHOLDER' = ('$$P_YMS$$', ':yMont_S'), "
  + " 'PLACEHOLDER' = ('$$P_YME$$', ':yMont_E')) "
  + " group by \"DEPTCODE\",left(\"STARTDAT\",6) " 
  + " order by left(\"STARTDAT\",6) "; 
      sql = sql.replace(":deptId",deptId).replace(":yMont_S",startDate).replace(":yMont_E",endDate);   
         jdbc.open(function(err, conn) { 
             if (err != null) {  
                  cb("1.jdbc open ERROR", null);
                 }
            jdbc.executeQuery(sql, function(err, rows) { 
                if (err != null) { 
                     cb("1.jdbc Query  ERROR", null); 
                   } 
                jdbc.close(function(err) {
                    if(err != null){  
                       cb("1.JDBC CLOSE ERROR", null);
                    } 
                }); 
                  var keys = [
                        {
                        oldKey: "",
                        newKey: "YMONT"
                        },
                        {
                        oldKey: "SUM",
                        newKey: "TOTALAMT"
                        }
                              ]; 
                 
              rs =  handleMoveResult(rows, keys)  
                cb(null,rs);
            });
        }); 
     }); 
     },
     function(cb){
          var jdbc = new ( require('jdbc') );
        jdbc.initialize(global.hanaConfig, function(err, res) {
        var sql =  "select \"DEPTCODE\",sum(\"APROAMT\") as \"TOTALAMT\" "
                   + " from \"_SYS_BIC\".\"cttqdc.subjects.em.output/CA_EM_PERSON_TRAVEL_COST\" "
          + " ('PLACEHOLDER' = ('$$P_USRID$$', '*'), "
          + " 'PLACEHOLDER' = ('$$P_DEPTID$$', ':deptId'), "  
          + " 'PLACEHOLDER' = ('$$P_YMS$$', ':yMont_S'), "
          + " 'PLACEHOLDER' = ('$$P_YME$$', ':yMont_E')) "
          + " group by \"DEPTCODE\" ";
      sql = sql.replace(":deptId",deptId).replace(":yMont_S",startDate).replace(":yMont_E",endDate);  
         jdbc.open(function(err, conn) { 
             if (err != null) {  
                  cb("2.jdbc open ERROR", null);
                 }
            jdbc.executeQuery(sql, function(err, rows) { 
                if (err != null) { 
                     cb("2.jdbc Query  ERROR", null); 
                   } 
                jdbc.close(function(err) {
                    if(err != null){  
                       cb("2.JDBC CLOSE ERROR", null);
                    } 
                });   
                  var keys = [
                        {
                        oldKey: "SUM",
                        newKey: "TOTALAMT"
                        }
                              ];  
              rs =  handleMoveResult(rows, keys)  
                cb(null,rs);
            });
        }); 
     }); 
     }  
 ], function (err, data) { 
        if (err) {
            Response.end(JSON.stringify({
                status: -1,
                msg: err
            }));
        } else {
            Response.end(JSON.stringify({
                status: 0,
                msg: "查询成功",
                data1:data[0],
                data2:data[1]
            }));
        }
    });  
}

function handleMoveResult(rows, keys) {
    var result = [];
    for (var i in rows) {
        var item = rows[i];
        for (var j in item) {
            for (var k in keys) {
                if (j == "" && j == keys[k].oldKey) {
                    //console.info(1,j,keys[k].oldKey,item[j]);
                    item[keys[k].newKey] = item[j];
                    delete item[j];
                    break;
                }
                if (j != "" && keys[k].oldKey != "" && j.toUpperCase().indexOf(keys[k].oldKey.toUpperCase()) != -1) {
                    //console.info(2,j,keys[k].oldKey,item[j]);
                    item[keys[k].newKey] = item[j];
                    delete item[j];
                    break;
                }
            }
        }
        result.push(item);
    }
    return result;
}
 
exports.Runner = run;
 