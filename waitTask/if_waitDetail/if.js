var MEAP=require("meap");


/**
 * 
 * 统一代办3.0
 * 代办列表：查询代办  流程和业务接口  
 * 作者：xialin
 * 时间：20160824
 */



function run(Param, Robot, Request, Response, IF)
{
   
  var arg = JSON.parse(Param.body.toString());
   var userId =arg.userId;
   var BUSSCATG =arg.BUSSCATG;
    if(null==userId||userId==""){
          Response.end(JSON.stringify({
                   status:-1,
                   message:"userId不能为空"
               }));
          return ;

    }
     if(null==BUSSCATG||BUSSCATG==""){
          Response.end(JSON.stringify({
                   status:-1,
                   message:"bussType不能为空"
               }));
          return ;

    }
  // var url2 =global.baseHANA+"/cttqdc/services/wflow/wait_task.xsodata/waitlist?$expand=Expand_task&$filter=substringof('"+userId+"',UID_FILTER) and BUSSCATG eq '"+BUSSCATG+"' &$format=json"
   //console.log("url2",url2);
   //http://10.10.1.104:8000/cttqdc/services/wflow/wait_task_detail.xsjs?UID=8101439&CATG=F010
   var url =global.baseHANA+"/cttqdc/services/wflow/wait_task_detail.xsjs?UID="+userId+"&CATG="+BUSSCATG;
   
   console.log(url);
   
   
   var option = {
        agent : false,
        method : "GET",
        url : url,
        BasicAuth : global.HanaAuth

    };
    MEAP.AJAX.Runner(option, function(err, res, data) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err) {
            console.log(data);
            var data = JSON.parse(data);
            if (data instanceof Array) {

                Response.end(JSON.stringify({
                   status:0,
                   data:data
               }));
            }else{
                Response.end(JSON.stringify({
                   status:-1,
                   message:"查询HANA出错"
               }));
            }

        } else {
            Response.end(JSON.stringify({
                   status:-1,
                   message:"查询HANA出错"
               }));
        }
    });
}




exports.Runner = run;