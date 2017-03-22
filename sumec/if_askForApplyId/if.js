var MEAP=require("meap");
/**
 * 起草一个流程,接口分配一个`申请流水号`
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param, Robot, Request, Response, IF)
{
    var arg = JSON.parse(Param.body.toString()); 
    var applyUser = arg.userId;
    var date = date2str(new Date(), "yyyy-MM-dd hh:mm:ss");
    var option = {
         CN : "Dsn=mysql-test",
         sql:"insert into T_PAY_APPLY(APPLY_USER, APPLY_DATE) values (\""+applyUser+"\", \""+date+"\")"
    };
    
    MEAP.ODBC.Runner(option,function(err,rs,cols){
        if(err==null || err==0){
            var option = {
                 CN : "Dsn=mysql-test",
                 sql:"SELECT * FROM `T_PAY_APPLY` where APPLY_USER=\""+applyUser+"\" ORDER BY APPLY_ID desc limit 1"             
            }
            MEAP.ODBC.Runner(option,function(err,rs,cols){
                if(err==null || err ==0){
                    Response.end(JSON.stringify({status:0, data:{applyId:rs[0].APPLY_ID}})); 
                }else{
                    Response.end(JSON.stringify({status:-1, msg:err})); 
                }
            })            
            
        }else{
            Response.end(JSON.stringify({status:-1, msg:err})); 
        }
    });
}

function date2str(x, y) {
   var z = {
      y: x.getFullYear(),
      M: x.getMonth() + 1,
      d: x.getDate(),
      h: x.getHours(),
      m: x.getMinutes(),
      s: x.getSeconds()
   };
   return y.replace(/(y+|M+|d+|h+|m+|s+)/g, function(v) {
      return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-(v.length > 2 ? v.length : 2))
   });
}

exports.Runner = run;