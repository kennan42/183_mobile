var MEAP=require("meap");


/**
 * 
 * 考勤
 * 请假、加班、考勤异常、出差公共接口
 * 作者：xialin
 * 时间：20161205
 */



function run(Param, Robot, Request, Response, IF)
{
   
  var arg = JSON.parse(Param.body.toString());
   var P_PERNR =arg.P_PERNR;  // 人员编号
   var BEGDA =arg.BEGDA;
   var ENDDA =arg.ENDDA;
   var BUSINESS_TYPE =arg.BUSINESS_TYPE;
   var BUSINESS_SUBTY =arg.BUSINESS_SUBTY;
   
   
 
   var url =global.baseHANA+"/cttqdc/services/wflow/get_hr_pubinfo.xsodata/Input(P_PERNR='0"+P_PERNR+"',P_BEGDA='"+BEGDA+"',P_ENDDA='"+ENDDA+"',P_BUSINESS_TYPE='"+BUSINESS_TYPE+"',P_BUSINESS_SUBTY='"+BUSINESS_SUBTY+"')/Results?$format=json";
   
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
            

                Response.end(JSON.stringify({
                   status:0,
                   data:data
               }));
            

        } else {
            Response.end(JSON.stringify({
                   status:-1,
                   message:"查询HANA出错"
               }));
        }
    });
}




exports.Runner = run;