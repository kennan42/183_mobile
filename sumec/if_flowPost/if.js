var MEAP=require("meap");
var util = require("../util.js");
var async = require("async");
/**
 * 提交起草的流程
 */
function run(Param, Robot, Request, Response, IF)
{
    var arg = JSON.parse(Param.body.toString()); 
    var applyUser = arg.applyUser;//申请人工号
    var applyId = arg.applyId;//流水号
    var applyDate = util.date2str(new Date(), "yyyy-MM-dd hh:mm:ss");// 申请日期
    var cstName = arg.cstName;// 收款单位
    var cstBank = arg.cstBank;// 收款方开户银行
    var bankNo = arg.bankNo;// 收款方开户帐号
    var currType = arg.currType;// 支付币种
    var amt = arg.amt;// 支付金额
    var confirm = "在审";// 支付金额
    var moduleId = arg.moduleId;
    var option = {
         CN : "Dsn=mysql-test",
         sql:"update T_PAY_APPLY set  APPLY_DATE=?, CST_NAME=?, CST_BANK=?, BANK_NO=?, CURR_TYPE=?, confirm=?, AMT=? where APPLY_ID=?",
         param:[applyDate,cstName, cstBank, bankNo, currType, confirm, amt, applyId]
    };
    MEAP.ODBC.Runner(util.makeOdbcOptions(option),function(err,rs,cols){
        if(err==null || err==0){
            Response.end(JSON.stringify({status:0,msg:"success"}));
            insertIntoFlowStep();
            for(var i in arg.payApplyDtl){
                var payApplyDtl = arg.payApplyDtl[i];
                var option2 = {
                     CN : "Dsn=mysql-test",
                     sql:"insert into T_PAY_APPLY_DTL (APPLY_ID,CONTRACT_ID,CONTRACT_AMT) values (?,?,?)",
                     param:[payApplyDtl.applyId, payApplyDtl.contractId, payApplyDtl.contractAmt]
                };
                MEAP.ODBC.Runner(util.makeOdbcOptions(option2),function(err,rs,cols){
                    if(err==null || err==0){
                        //Response.end(JSON.stringify({status:0, msg:"success"})); 
                    }
                    else{
                        //Response.end(JSON.stringify({status:-1, msg:"false"})); 
                        console.log(JSON.stringify({err:err, rs:rs}));
                    }
                })
            }
        }else{
            Response.end(JSON.stringify({status:-1,msg:err}));
        }
    });
    
    
    function insertIntoFlowStep(){
            var postTime = util.date2str(new Date(), "yyyy-MM-dd hh:mm:ss");
            var option3 = {
                 CN : "Dsn=mysql-test",
                 sql:"insert into T_FLOW_DETAILS (MODULE_ID,REF_VALUE,USER_ID,USER_NAME, POST_TIME, DTL_STEP, DEAL_FLAG, IS_VALID) values (?,?,?,?,?,?,?,?)",
                 param:[moduleId, applyId, 1235, "审批人1", postTime,1,0,1]
            };
            for(var i=0; i<2; ++i){
                if(i==1)  option3.param = [moduleId, applyId, 1236, "审批人2",postTime,2,0,1];
                console.log(JSON.stringify(option3));
                MEAP.ODBC.Runner(util.makeOdbcOptions(option3),function(err,rs,cols){
                    if(err==null || err==0){
                        //Response.end(JSON.stringify({status:0, msg:"success"})); 
                    }
                    else{
                        //Response.end(JSON.stringify({status:-1, msg:"false"})); 
                        console.log(JSON.stringify({err:err, rs:rs}));
                    }
                })
            }
    }

}




exports.Runner = run;
