var MEAP=require("meap"); 
 
/**
 * 出差费用个人和部门总金额接口
 * 
 * zrx
 * 2016.10.24
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param, Robot, Request, Response, IF)
{ 
    var arg =JSON.parse(Param.body.toString());
    var usrId = arg.usrId;//个人编号 
    var yMont_S =arg.yMont_S;//开始时间
    var yMont_E =arg.yMont_E;//结束时间 
    //http://10.10.1.104:8000/cttqdc/services/erp/em/EM_TRAVEL_ALL_INTERFACE.xsodata/Input(P_USERID='usrId',P_YMS='yMont_S',P_YME='yMont_E')/Results?$metadata&$format=json
     var url =global.baseHANA+"/cttqdc/services/erp/em/EM_TRAVEL_ALL_INTERFACE.xsodata"
    +"/Input(P_USERID='"+usrId+"',P_YMS='"+yMont_S+"',P_YME='"+yMont_E+"')/Results?$metadata&$format=json";
     console.log(url);
             var option = {  
             method : "GET",
             url : url,
             BasicAuth : global.HanaAuth 
    }; 
       MEAP.AJAX.Runner(option, function(err, res, data) {
            Response.setHeader("Content-type", "text/json;charset=utf-8");
         if (!err) {  
             var data= JSON.parse(data); 
             if(data&&data.d&&data.d.results){
                  if(data.d.results.length!=0){
                    Response.end(JSON.stringify({
                     status:0,
                     mas:"查询成功",
                     data:data.d.results
                 }));  
                  }else{
                     Response.end(JSON.stringify({
                     status:1,
                     mas:"查询为空",
                     data:data.d.results
                 })); 
                  }
             }else{
                Response.end(JSON.stringify({
                     status:-1,
                     mas:"查询失败11" 
                 }));  
             } 
            }else{
                Response.end(JSON.stringify({
                     status:-1,
                     mas:"查询失败12"
                 }));  
            }  
         }); 
}
 
exports.Runner = run;
 