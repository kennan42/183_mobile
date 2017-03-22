var MEAP=require("meap");
var async = require("async");
 
/**
 * 部门报销运营费用统计接口
 * 1运营费用统计信息列表2.运营费用每月信息列表
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
	var deptId = arg.deptId;//部门编号
	var yMont_S =arg.yMont_S;//开始时间
	var yMont_E =arg.yMont_E;//结束时间
	
	//var url1 =global.baseHANA+"/cttqdc/services/erp/em/EM_DEPT_INTERFACE.xsodata/Input(P_DEPTID='"+deptId+"',P_YMS='"+yMont_S+"',P_YME='"+yMont_E+"')/Results?$metadata&$format=json&$select=DEPTCODE,DEPTNM,APROAMT";
    async.parallel([
        function(cb){//运营费用统计信息列表
            var url =global.baseHANA+"/cttqdc/services/erp/em/EM_DEPT_INTERFACE.xsodata/Input(P_DEPTID='"+deptId+"',P_YMS='"+yMont_S+"',P_YME='"+yMont_E+"')/Results?$metadata&$format=json&$select=DEPTCODE,DEPTNM,APROAMT";
             console.log(url);
             var option = { 
             method : "GET",
             url : url,
             BasicAuth : global.HanaAuth 
    }; 
       MEAP.AJAX.Runner(option, function(err, res, data) {
         if (!err) { 
             var data= JSON.parse(data); 
             if(data&&data.d&&data.d.results){
                  cb(null,data.d.results);
             }else{
                cb("查询HANA出错11",null);  
             } 
            }else{
                cb("查询HANA出错12",null); 
            }  
         }); 
        }, 
        function(cb){
           //运营费用统计信息列表
           //http://10.10.1.104:8000/cttqdc/services/erp/em/EM_DEPT_INTERFACE.xsodata/Input(P_DEPTID='deptId',P_YMS='yMont_S',P_YME='yMont_E')/Results?$metadata&$format=json&$select=EXPMONTH,APROAMT
            var url =global.baseHANA+"/cttqdc/services/erp/em/EM_DEPT_INTERFACE.xsodata/Input(P_DEPTID='"+deptId+"',P_YMS='"+yMont_S+"',P_YME='"+yMont_E+"')/Results?$metadata&$format=json&$select=EXPMONTH,APROAMT";
            console.log(url);
             var option = { 
             method : "GET",
             url : url,
             BasicAuth : global.HanaAuth 
    }; 
       MEAP.AJAX.Runner(option, function(err, res, data) {
         if (!err) { 
             var data= JSON.parse(data);
             if(data&&data.d&&data.d.results){
                  cb(null,data.d.results);
             }else{
                cb("查询HANA出错21",null);  
             } 
            }else{
                cb("查询HANA出错22",null); 
            }  
         });  
        } 
    ],function(err,data){
      Response.setHeader("Content-type", "text/json;charset=utf-8");
       if(!err){
           Response.end(JSON.stringify({
                "status" : "0",
                "msg" :"查询成功",
                "data1" : data[0],
                "data2" : data[1]
           }));
       } else{
          Response.end(JSON.stringify({
                 status: -1,
                 msg: err
            })); 
       }  
    }); 
}


exports.Runner = run;


                                

	

