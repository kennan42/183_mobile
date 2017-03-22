var MEAP=require("meap");
var _=require("underscore");


function run(Param, Robot, Request, Response, IF)
{
    
    var  arg = JSON.parse(Param.body.toString());
  var url = global.baseHANA +"/cttqdc/services/wflow/wait_task.xsodata/W_UID(P_UID='"+arg.userId+"')/wait_task?$select=BUSSCATG,BUSSCATGNM,COUNT&$format=json";
    var option={
         agent:false,
         method : "GET",
         url:url,
         BasicAuth:global.HanaAuth
        
    };
    
    MEAP.AJAX.Runner(option, function(err, res, data) {
    Response.setHeader("Content-type","text/json;charset=utf-8");
     if(!err){
         var data =JSON.parse(data);
        console.log(data.d.results);
        // _.pluck(data.output.taskList, 'taskNum');
        var BUSSCATG =_.pluck(data.d.results,'BUSSCATG');
        var COUNT =_.pluck(data.d.results,'COUNT');
         console.log(BUSSCATG);
            console.log(COUNT);
         
         var a =_.object(BUSSCATG,COUNT);
          console.log(a); 
       
               a['test']=1;
               console.log(a);   
               
               console.log(JSON.stringify(a));
               
                    
     }else{
         //callback(-1,"查询HANA接口出错");
     }
   }, Robot);
}

exports.Runner = run;