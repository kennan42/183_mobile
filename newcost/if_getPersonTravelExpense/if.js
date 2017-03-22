var MEAP=require("meap");
var async = require("async");
/**
 * 个人出差费用报销
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
    var userId = arg.usrId; 
    var startDate = arg.yMont_S;
    var endDate = arg.yMont_E; 
    if(userId ==null||userId == ''||startDate == null ||startDate ==''||endDate ==null||endDate ==''){ 
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "传递参数错误"
        }));
        return;   
    } 
    if(userId.length == 7){
        userId = "0"+userId;
    }
    //查询出差信息列表,行程组列表,行程列表
 async.parallel([
     function(cb){
          var jdbc = new ( require('jdbc') );
        jdbc.initialize(global.hanaConfig, function(err, res) {
      /*  var sql =  "select  \"TRAVLSGRP\",sum(\"ZNUM\") AS \"ZNUM\", "
     + " sum(\"ZDAYS\") AS \"ZDAYS\",sum(\"APROAMT\") AS \"APROAMT\" "
     + " from \"_SYS_BIC\".\"cttqdc.subjects.em.output/CA_EM_PERSON_TRAVEL_COST\"" 
     + " ('PLACEHOLDER' = ('$$P_USRID$$', ':usrId'), " 
     + " 'PLACEHOLDER' = ('$$P_DEPTID$$', '*'), "
     + " 'PLACEHOLDER' = ('$$P_YMS$$', ':yMont_S'), "
     + " 'PLACEHOLDER' = ('$$P_YME$$', ':yMont_E')) "
     + " group by \"TRAVLSGRP\" "; 
     */
    
 /*var sql = "select sum(\"ZDAYS\") as \"ZDAYS\" from ( "
+ " (select ifnull(sum(days_between(\"STARTDAT_MIN\",\"STARTDAT_MAX\") + 1),0) as \"ZDAYS\" from ( "
+ " select  distinct \"STARTDAT_MIN\",\"STARTDAT_MAX\" from ( "
+ " select first_value(\"STARTDAT\") over(partition by \"TRAVID\",left(\"TRAVLSGRP\",3) order by \"STARTDAT\" asc) as \"STARTDAT_MIN\", "
+ " first_value(\"STARTDAT\") over(partition by \"TRAVID\",left(\"TRAVLSGRP\",3) order by \"STARTDAT\" desc) as \"STARTDAT_MAX\" "
+ " from \"_SYS_BIC\".\"cttqdc.subjects.em.output/CA_EM_PERSON_TRAVEL_COST\" "
+ " ('PLACEHOLDER' = ('$$P_USRID$$', ':usrId'), "
+ " 'PLACEHOLDER' = ('$$P_DEPTID$$', '*'), "
+ " 'PLACEHOLDER' = ('$$P_YMS$$', ':yMont_S'), "
+ " 'PLACEHOLDER' = ('$$P_YME$$', ':yMont_E')) "
+ " where \"TRAVLSGRP\" <> '' "
+ " order by \"TRAVID\",\"TRAVLSGRP\"))) "
+ " union all "
+ " (select sum(\"ZDAYS\") AS \"ZDAYS\" "
+ " from \"_SYS_BIC\".\"cttqdc.subjects.em.output/CA_EM_PERSON_TRAVEL_COST\" "
+ " ('PLACEHOLDER' = ('$$P_USRID$$', ':usrId'), "
+ "  'PLACEHOLDER' = ('$$P_DEPTID$$', '*'), "
+ "  'PLACEHOLDER' = ('$$P_YMS$$', ':yMont_S'), "
+ "  'PLACEHOLDER' = ('$$P_YME$$', ':yMont_E')) "
+ "     where \"TRAVLSGRP\" = '')) ";*/
 
 var sql = "select sum(\"ZDAYS\") as \"ZDAYS\" from ( " 
+ " (select sum(days_between(\"STARTDAT_MIN\",\"STARTDAT_MAX\") + 1) as \"ZDAYS\"   " 
+ " from (select  distinct \"STARTDAT_MIN\",\"STARTDAT_MAX\" from ( "
+ "  select first_value(\"STARTDAT\") over(partition by \"TRAVID\",left(\"TRAVLSGRP\",3) order by \"STARTDAT\" asc) as \"STARTDAT_MIN\", "
+ " first_value(\"STARTDAT\") over(partition by \"TRAVID\",left(\"TRAVLSGRP\",3) order by \"STARTDAT\" desc) as \"STARTDAT_MAX\" "
+ "  from \"_SYS_BIC\".\"cttqdc.subjects.em.output/CA_EM_PERSON_TRAVEL_COST\" "
+ " ('PLACEHOLDER' = ('$$P_USRID$$', ':usrId'), "
+ " 'PLACEHOLDER' = ('$$P_DEPTID$$', '*'), "
+ " 'PLACEHOLDER' = ('$$P_YMS$$', ':yMont_S'), "
+ " 'PLACEHOLDER' = ('$$P_YME$$', ':yMont_E')) "
+ " where \"TRAVLSGRP\" <> '' "
+ " order by \"TRAVID\",\"TRAVLSGRP\"))) "
+ " union all "
+ " (select sum(\"ZDAYS\") AS \"ZDAYS\" "
+ " from \"_SYS_BIC\".\"cttqdc.subjects.em.output/CA_EM_PERSON_TRAVEL_COST\" "
+ " ('PLACEHOLDER' = ('$$P_USRID$$', ':usrId'), "
+ "  'PLACEHOLDER' = ('$$P_DEPTID$$', '*'), "
+ "  'PLACEHOLDER' = ('$$P_YMS$$', ':yMont_S'), "
+ "  'PLACEHOLDER' = ('$$P_YME$$', ':yMont_E')) "
+ "   where \"TRAVLSGRP\" = '')) ";
  
      sql = sql.replace(":usrId",userId).replace(":yMont_S",startDate).replace(":yMont_E",endDate).replace(":usrId",userId).replace(":yMont_S",startDate).replace(":yMont_E",endDate); 
  console.log("sql1:"+sql);
         jdbc.open(function(err, conn) { 
             if (err != null) {  
                  cb("1:jdbc open ERROR1", null);
                 }
            jdbc.executeQuery(sql, function(err, rows) {  
                if (err != null) { 
                     cb("1:jdbc Query  ERROR2", null); 
                   } else{
                       jdbc.close(function(err) {
                             if(err != null){  
                               cb("1:JDBC CLOSE ERROR3", null);
                              } 
                           });   
                    var keys = [
                        {
                        oldKey: "SUM",
                        newKey: "ZDAYS"
                        }
                              ];  
              rs =  handleMoveResult(rows, keys)  
                cb(null,rs); 
                   }
              
            });
        }); 
     }); 
     } ,
     function(cb){ 
          var jdbc = new ( require('jdbc') );
        jdbc.initialize(global.hanaConfig, function(err, res) {
        /*var sql =  "select  \"TRAVLSGRP\",\"STARTDAT_MIN\",\"STARTDAT_MAX\",\"TRAVTYP\", \"ZDAYS\",\"AUFNR\", "
    +" sum(\"APROAMT\") as \"APROAMT\" "
    +" from \"_SYS_BIC\".\"cttqdc.subjects.em.output/CA_EM_PERSON_TRAVEL_COST\"" 
    +"  ('PLACEHOLDER' = ('$$P_USRID$$', ':usrId'), "
    +"   'PLACEHOLDER' = ('$$P_DEPTID$$', '*'), "
    +"    'PLACEHOLDER' = ('$$P_YMS$$', ':yMont_S'), "
    +"    'PLACEHOLDER' = ('$$P_YME$$', ':yMont_E')) "
    +" group by \"TRAVLSGRP\",\"STARTDAT_MIN\",\"STARTDAT_MAX\",\"TRAVTYP\",\"ZDAYS\",\"AUFNR\" ";
    */
    var sql = "select count(*) \"ZNUM\",sum(\"APROAMT\")  \"APROAMT\" "
   + " from (select \"TRAVID\",left(\"TRAVLSGRP\",3) as \"TPREFIX\",sum(\"APROAMT\")  \"APROAMT\" "
   + " from \"_SYS_BIC\".\"cttqdc.subjects.em.output/CA_EM_PERSON_TRAVEL_COST\" "
   + " ('PLACEHOLDER' = ('$$P_USRID$$', ':usrId'), " 
   + " 'PLACEHOLDER' = ('$$P_DEPTID$$', '*'), "
   + " 'PLACEHOLDER' = ('$$P_YMS$$', ':yMont_S'), "
   + " 'PLACEHOLDER' = ('$$P_YME$$', ':yMont_E')) "
   + " group by \"TRAVID\",left(\"TRAVLSGRP\",3))";
      sql = sql.replace(":usrId",userId).replace(":yMont_S",startDate).replace(":yMont_E",endDate); 
         console.log("sql2:"+sql);
         jdbc.open(function(err, conn) { 
             if (err != null) {  
                  cb("2:jdbc open ERROR1", null);
                 }
            jdbc.executeQuery(sql, function(err, rows) {
                console.log("err:",err); 
                console.log("rows",rows); 
                if (err != null) { 
                     cb("2:jdbc Query  ERROR2", null); 
                   } else{
                       jdbc.close(function(err) {
                             if(err != null){  
                                cb("2:JDBC CLOSE ERROR3", null);
                                  } 
                         });   
                   var keys = [
                        {
                        oldKey: "COUNT",
                        newKey: "ZNUM"
                        },
                        {
                        oldKey: "SUM",
                        newKey: "APROAMT"
                        }
                              ];  
              rs =  handleMoveResult(rows, keys)  
                cb(null,rs);   
                   }
            });
        }); 
     }); 
     },     function(cb){ 
          var jdbc = new ( require('jdbc') );
        jdbc.initialize(global.hanaConfig, function(err, res) {
        var sql =  "select \"TRAVGRPID\",\"STARTDAT_MIN\",\"STARTDAT_MAX\",\"TRAVTYP\",\"ZDAYS\",\"AUFNR\","
    + " sum(\"APROAMT\") as \"APROAMT\" from \"_SYS_BIC\".\"cttqdc.subjects.em.output/CA_EM_PERSON_TRAVEL_COST\" " 
    + " ('PLACEHOLDER' = ('$$P_USRID$$', ':usrId'), "
    + " 'PLACEHOLDER' = ('$$P_DEPTID$$', '*'), "
    + " 'PLACEHOLDER' = ('$$P_YMS$$', ':yMont_S'), "
    + " 'PLACEHOLDER' = ('$$P_YME$$', ':yMont_E')) "
    + " where \"ZDAYS\" <> 0 "
    + " group by \"TRAVGRPID\",\"STARTDAT_MIN\",\"STARTDAT_MAX\",\"TRAVTYP\",\"ZDAYS\",\"AUFNR\" "
    + " order by \"STARTDAT_MIN\" asc"; 
	 
       sql = sql.replace(":usrId",userId).replace(":yMont_S",startDate).replace(":yMont_E",endDate); 
        console.log("sql3:"+sql);
         jdbc.open(function(err, conn) { 
             if (err != null) {  
                  cb("3:jdbc open ERROR1", null);
                 }
            jdbc.executeQuery(sql, function(err, rows) {  
                 if (err != null) { 
                     cb("3:jdbc Query  ERROR2", null); 
                   } else{
                       jdbc.close(function(err) {
                            if(err != null){  
                              cb("3:JDBC CLOSE ERROR3", null);
                                } 
                        });   
                  var keys = [
                        {
                        oldKey: "SUM",
                        newKey: "APROAMT"
                        } 
                              ];  
              rs =  handleMoveResult(rows, keys)  
                cb(null,rs);   
                   }
            });
        }); 
     }); 
     },
     function(cb){ 
          var jdbc = new ( require('jdbc') );
        jdbc.initialize(global.hanaConfig, function(err, res) {
       /* var sql =  "select \"TRAVGRPID\", \"TRAVLSGRP\",\"STARTDAT\",\"DAY_OF_WEEK\",\"ORIGCITY\",\"ORIGCITYNM\" "
        + ",\"ORIGCOUNTY\",\"ORIGCOUNTYNM\",\"DESTCITY\",\"DESTCITYNM\",\"DESTCOUNTY\",\"DESTCOUNTYNM\", "
        + " \"TRAVTOPIC\" from \"_SYS_BIC\".\"cttqdc.subjects.em.output/CA_EM_PERSON_TRAVEL_COST\" " 
        + " ('PLACEHOLDER' = ('$$P_USRID$$', ':usrId'), "
        + " 'PLACEHOLDER' = ('$$P_DEPTID$$', '*'), "
        + " 'PLACEHOLDER' = ('$$P_YMS$$', ':yMont_S'), "
        + " 'PLACEHOLDER' = ('$$P_YME$$', ':yMont_E')) "; 
        + " order by \"TRAVGRPID\" ";
		
		*/
		
		var sql ="select  \"TRAVGRPID\",\"TRAVLSGRP\",\"STARTDAT\",\"DAY_OF_WEEK\",\"ORIGCITY\",\"ORIGCITYNM\", \"ORIGCOUNTY\", "
      + "  \"ORIGCOUNTYNM\", \"DESTCITY\", \"DESTCITYNM\",\"DESTCOUNTY\", \"DESTCOUNTYNM\",\"TRAVTOPIC\" "
      + " from \"_SYS_BIC\".\"cttqdc.subjects.em.output/CA_EM_PERSON_TRAVEL_COST\"  "
      + " ('PLACEHOLDER' = ('$$P_USRID$$', ':usrId'), "
      + " 'PLACEHOLDER' = ('$$P_DEPTID$$', '*'), "
      + " 'PLACEHOLDER' = ('$$P_YMS$$', ':yMont_S'), "
      + " 'PLACEHOLDER' = ('$$P_YME$$', ':yMont_E')) "
	  + " order by \"TRAVGRPID\",\"STARTDAT\" ";
	
		
       sql = sql.replace(":usrId",userId).replace(":yMont_S",startDate).replace(":yMont_E",endDate);   
           console.log("sql4:"+sql);
         jdbc.open(function(err, conn) { 
             if (err != null) {  
                  cb("4:jdbc open ERROR1", null);
                 }
            jdbc.executeQuery(sql, function(err, rows) { 
                 if (err != null) { 
                     cb("4:jdbc Query  ERROR2", null); 
                   } else{
                       jdbc.close(function(err) {
                            if(err != null){  
                              cb("4:JDBC CLOSE ERROR3", null);
                                } 
                        });   
                   cb(null,rows);  
                   }
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
                data1:data[0] ,
                data2:data[1] ,
                data3:data[2] ,
                data4:data[3] 
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
 