var MEAP=require("meap");



/*
 * 支付成功或其他事件监听
 * 作者：xialin
 * 时间：20160420
 * 
 * 
 */
function run(Param, Robot, Request, Response, IF)
{
	
	Response.setHeader("Content-Type", "text/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
	
	if(arg.type ==undefined){
	    Response.end(JSON.stringify({
	        status:400,
	        msg:"Event 对象中缺少 type 字段"
	    }));
	}
	
	switch(arg.type){
	    case "charge.succeeded":
          // 开发者在此处加入对支付异步通知的处理代码
          
          Response.end(JSON.stringify({
            status:200,
            msg:"OK"
          }));
          
          
          break;
        case "refund.succeeded":
          // 开发者在此处加入对退款异步通知的处理代码
          Response.end(JSON.stringify({
            status:200,
            msg:"OK"
         }));
          break;
        default:
         
          Response.end(JSON.stringify({
            status:400,
            msg:"未知 Event 类型"
         }));
          break;
	    
	    
	}
	    Response.end(JSON.stringify({
            status:400,
            msg:"test"
         }));
	
	
}

exports.Runner = run;


                                

	

