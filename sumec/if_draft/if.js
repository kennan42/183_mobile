var MEAP=require("meap");

/**
 * 提交起草的流程
 */
function run(Param, Robot, Request, Response, IF)
{
    var odbc = MEAP.ODBC;
    var db = new odbc.DataBase();
    var arg = JSON.parse(Param.body.toString()); 
    var applyUser = arg.userId;//申请人工号
    var applyId = arg.applyId;//流水号
    var applyDate = arg.applyDate;// 申请日期
    var cstName = arg.cstName;// 收款单位
    var cstBank = arg.cstBank;// 收款方开户银行
    var bankNo = arg.bankNo;// 收款方开户帐号
    var currType = arg.currType;// 支付币种
    var amt = arg.amt;// 支付金额

    var option = {
         CN : "Dsn=mysql-test",
         sql:"update T_PAY_APPLY set APPLY_DATE=? where APPLY_ID=?"
    };
    db.openSync(option.CN);
    var stmt = db.prepareSync(option.sql);
    stmt.execute(['2014-3-21 12:22', 9],function(err, result){
        Response.end(JSON.stringify({err:err, result:result})); 
        result.closeSync();
        db.closeSync();
    });
}



exports.Runner = run;