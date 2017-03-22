var MEAP=require("meap");
var util=require("../util.js");
var async = require("async");
function run(Param, Robot, Request, Response, IF)
{
    //Add your normal handling code
    var params = Param.params;
    var userId = params.userId;//审批人工号
    //查询审批表
    async.waterfall([
        //查询审批表记录
        function(cb){
            queryAllApproveByUserId(userId,cb);
        },
        //排除非当前人审批的记录
        function(data,cb){
            var queue = async.queue(function(task,cb){
                console.log("task: "+JSON.stringify(task));
                ifIsCurrentApprove(task["refValue"],userId,function(err,data){
                    console.log("ifIsCurrentApprove end:"+JSON.stringify({err:err, data:data}));
                    task["isCurrentApprove"] = data;
                    cb(null,null);
                });
            },5);
            queue.push(data);
            queue.drain = function() {
                var result = new Array();
                for(var i in data){
                    if(data[i]["isCurrentApprove"]==true){
                        result.push(data[i]);
                    }
                }
                cb(null,result);
            }
        }
    ],function(err,data){
        //根据所有当前人审批的流水号,查询流程业务数据
        if(err==null || err==0){
            var applyIds = new Array();
            for(var i in data){
                applyIds.push(data[i].refValue);
            }
            queryPayApplyByApplyIds(applyIds,function(err,data){
                if(err==null || err==0){
                    Response.end(JSON.stringify({status:0, data:data}));
                }else{
                    Response.end(JSON.stringify({status:-1,message:"failed"}));
                }
            });
        }else{
            Response.end(JSON.stringify({status:-1,message:"failed"}));
        }
    });

}

/**
 * 根据流水号数组查询业务数据
 * @param {Object} applyIds
 * @param {Object} cb
 */
function queryPayApplyByApplyIds(applyIds,cb){
    var applyIdsStr = "";
    for(var i in applyIds){
        if(i==0)
            applyIdsStr +=  applyIds[i];
        else
            applyIdsStr += "," + applyIds[i];
    }
    var option = {
        CN : "Dsn=mysql-test",
        sql:"select APPLY_ID applyId, APPLY_USER applyUser, APPLY_DATE applyDate, CST_NAME cstName, CST_BANK cstBank, BANK_NO bankNo, CURR_TYPE currType, AMT amt, CONFIRM confirm from T_PAY_APPLY where APPLY_ID in ("+applyIdsStr+")",
        param:[]        
    };
    MEAP.ODBC.Runner(util.makeOdbcOptions(option),function(err,rs,cols){
        console.log("queryPayApplyByApplyIds:"+JSON.stringify(rs));
        if(err==null || err==0){   
            for(var i in rs){
                rs[i]["moduleName"] = "付款审批流程";
            }
            cb(null,rs);
        }else{
            cb(err,rs);
        }
        
    });
    
}

/**
 * 根据工号查询审批表中所有尚未审批的记录
 * @param {Object} userId
 * @param {Object} cb
 */
function queryAllApproveByUserId(userId,cb){
    var option = {
        CN : "Dsn=mysql-test",
        sql:"select MODULE_ID moduleId, REF_VALUE refValue, USER_ID userId, DTL_STEP dtlStep from T_FLOW_DETAILS where USER_ID=? and DEAL_FLAG=0 and IS_VALID=1",
        param:[userId]         
    };
    MEAP.ODBC.Runner(util.makeOdbcOptions(option),function(err,rs,cols){
        console.log("queryAllApproveByUserId:"+JSON.stringify(rs));
        if(err==null || err==0){
            cb(null,rs);
        }else{
            cb(err,rs);
        }
    })
    
}

/**
 * 根据业务数据流水号和用户工号判断是否是当前人审批
 * @param {Object} refValue
 * @param {Object} userId
 * @param {Object} cb
 */
function ifIsCurrentApprove(refValue, userId, cb){
    var option = {
        CN : "Dsn=mysql-test",
        sql:"select MODULE_ID moduleId, REF_VALUE refValue, USER_ID userId, DTL_STEP dtlStep, DEAL_FLAG dealFlag, IS_VALID isValid from T_FLOW_DETAILS where REF_VALUE=?",
        param:[refValue]              
    };
    MEAP.ODBC.Runner(util.makeOdbcOptions(option), function(err,rs,cols){
        console.log("ifIsCurrentApprove:"+JSON.stringify(rs));
        if(err==null || err==0){
            var resultMap = new Object();
            var current = null;
            for(var i in rs){
                resultMap[rs[i]["dtlStep"]] = rs[i];
                if(rs[i]["userId"]==userId){
                    current = rs[i];
                }
            }
            if(!current){
                //该流程不需要当前人审批
                cb(null ,false);
                return;
            }
            if( current["dealFlag"] ==1  || (current["dealFlag"]==0 && current["dtlStep"]!=1 && ( resultMap[current["dtlStep"]-1]["isValid"]==0 || resultMap[current["dtlStep"]-1]["dealFlag"]==0)) ){
                //前一个人尚未审批
                cb(null,false);
                return;
            }
            cb(null,true);
            return;
        }else{
            cb(err,rs);
        }
    });
}

exports.Runner = run;
