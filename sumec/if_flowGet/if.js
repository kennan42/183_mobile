var MEAP=require("meap");
var util=require("../util.js");
var async = require("async");
/**
 * 查询流程详情
 */
function run(Param, Robot, Request, Response, IF)
{
    var params = Param.params;
    var applyId = params.applyId;//流水号
    var moduleId = params.moduleId;//审批模块id

    async.parallel([
        queryPayApply,
        queryFlow
    ],function(err,data){
        console.log(data);
        if(!err){
            Response.end(JSON.stringify({status:0,data:{payApply:data[0],flow:data[1]}}));
        }else{
            Response.end(JSON.stringify({status:-1,msg:err}));
        }
    })

    function queryPayApply(cb){
        var option = {
             CN : "Dsn=mysql-test",
             sql:"select APPLY_ID applyId, APPLY_USER applyUser, APPLY_DATE applyDate, CST_NAME cstName, CST_BANK cstBank, BANK_NO bankNo, CURR_TYPE currType, AMT amt, CONFIRM confirm from T_PAY_APPLY where APPLY_ID=? limit 1",
             param:[applyId]
        };    
        
        var option2 = {
            CN : "Dsn=mysql-test",
            sql:"select APPLY_DTL_ID applyDtlId, APPLY_ID applyId,  CONTRACT_ID contractId, CONTRACT_AMT contractAmt from T_PAY_APPLY_DTL where APPLY_ID=? ",
            param:[applyId]            
        };
        
        
        async.parallel([
            function(cb){
                MEAP.ODBC.Runner( util.makeOdbcOptions(option), function(err,rs,cols){
                    if(err==null || err==0){
                        cb(null,rs);
                    }else{
                        cb(err,rs);
                    }
                },Robot);
            },
            function(cb){
                MEAP.ODBC.Runner(util.makeOdbcOptions(option2), function(err,rs,cols){
                    if(err==null || err==0){
                        cb(null,rs);
                    }else{
                        cb(err,rs);
                    }
                },Robot);            
            }
        ],function(err,data){
            if(!err){
                data[0][0].payApplyDtl = data[1];
                cb(null, data[0][0]);
            }else{
                cb(err,data);
            }
        })
    }

    function queryFlow(cb){
        console.log("begin queryFlow: "+cb);
        var option = {
             CN : "Dsn=mysql-test",
             sql:"select MODULE_ID moduleId, MODULE_NAME moduleName, TABLE_NAME tableName, PK_COLUMN pkColumn, SP_COLUMN spColumn, SP_URL spUrl from T_FLOW_MODULE where MODULE_ID=? limit 1",
             param:[moduleId]
        };    
        var option2 = {
            CN : "Dsn=mysql-test",
            sql:"select INT_ID intId, MODULE_ID moduleId,  REF_VALUE refValue, USER_ID userId, USER_NAME userName, POST_TIME postTime, DTL_STEP dtlStep, DEAL_FLAG dealFlag, DEAL_TIME dealTime, IS_VALID isValid, COMMENT comment from T_FLOW_DETAILS where MODULE_ID=? and REF_VALUE=?",
            param:[moduleId, applyId]            
        };
        async.parallel([
            function(cb){
                MEAP.ODBC.Runner( util.makeOdbcOptions(option), function(err,rs,cols){
                    console.log(rs);
                    if(err==null || err==0){
                        cb(null,rs);
                    }else{
                        cb(err,rs);
                    }
                },Robot);
            },
            function(cb){
                MEAP.ODBC.Runner(util.makeOdbcOptions(option2), function(err,rs,cols){
                    console.log(rs);
                    if(err==null || err==0){
                        cb(null,rs);
                    }else{
                        cb(err,rs);
                    }
                },Robot);            
            }
        ],function(err,data){
            console.log(data);
            if(!err){
                var result = new Object();
                result.flowModule= data[0][0];
                result.flowDetails= data[1];
                cb(null, result);
            }else{
                cb(err,data);
            }
        })
    
 }
 
 function test233(cb){
     console.log("begin test233 :");
     cb(null, 233);
 }  
    
}




exports.Runner = run;
