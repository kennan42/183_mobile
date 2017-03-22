var MEAP=require("meap");
var util = require("../util.js");
/**
 * 提交审批,将审批记录标记为已处理
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param, Robot, Request, Response, IF)
{
    var arg = JSON.parse(Param.body.toString());
    var intId = arg.intId;
    var comment = arg.comment;//审批备注
    var dealTime = util.date2str(new Date(), "yyyy-MM-dd hh:mm:ss");
    var isValid = arg.isValid;//是否有效
    var dealFlag = 1;//标记成已处理

    //更新审批记录
    var option = {
        CN : "Dsn=mysql-test",
        sql:"update T_FLOW_DETAILS set DEAL_TIME=?, DEAL_FLAG=?, IS_VALID=?, COMMENT=? where INT_ID=?",
        param:[dealTime, dealFlag, isValid, comment, intId]
    };
    MEAP.ODBC.Runner(util.makeOdbcOptions(option),function(err,rs,cols){
        if(err==null || err==0){
            Response.end(JSON.stringify({status:0, message:"success"})); 
        }
        else{
            Response.end(JSON.stringify({status:-1, message:"false"})); 
            console.log(JSON.stringify({err:err, rs:rs}));
        }
    });
    
    //如果是驳回,需要修改单据表记录为`退回`
    //判断是否是最后一次审批,如果是,需要修改单据表记录为"通过"
    var applyId = arg.applyId;
    if(isValid==1){
        //有效,查询最后一个审批人
        var option ={
            CN : "Dsn=mysql-test",
            sql:"select INT_ID intId from T_FLOW_DETAILS where REF_VALUE=?  order by DTL_STEP desc limit 1",
            param:[applyId]        
        };
        MEAP.ODBC.Runner(util.makeOdbcOptions(option),function(err,rs,cols){
            if(err==null || err==0){
                if(rs[0].intId==intId){
                    //当前是最后一个审批人
                    //修改单据表记录为"通过"
                    var option = {
                        CN : "Dsn=mysql-test",
                        sql:"update T_PAY_APPLY set CONFIRM=? where APPLY_ID=?",
                        param:["通过",applyId]                       
                    };
                    MEAP.ODBC.Runner(util.makeOdbcOptions(option),function(err,rs,cols){
                        if(err==null || err==0){
                            console.log("success to update the confirm of T_PAY_APPLY");
                        }else{
                            console.log("success to update the confirm of T_PAY_APPLY");
                        }
                    });
                }else{
                    console.log("no need to update the confirm of T_PAY_APPLY");
                }
            }
            else{
                //Response.end(JSON.stringify({status:-1, msg:"false"})); 
                console.log(JSON.stringify({err:err, rs:rs}));
            }
        });    
    }else{
        //无效,驳回
        //修改单据表记录为"驳回"
        var option = {
            CN : "Dsn=mysql-test",
            sql:"update T_PAY_APPLY set CONFIRM=? where APPLY_ID=?",
            param:["驳回",applyId]                       
        }
        MEAP.ODBC.Runner(util.makeOdbcOptions(option),function(err,rs,cols){
            if(err==null || err==0){
                console.log("success to update the confirm of T_PAY_APPLY");
            }else{
                console.log("failed to update the confirm of T_PAY_APPLY");
            }
        })        
    }
        
}

exports.Runner = run;
