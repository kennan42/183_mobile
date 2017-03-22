var MEAP=require("meap");

var _=require("underscore");

var  moment =require('moment');

function run(Param, Robot, Request, Response, IF)
{
    //当前时间
  var  currentDate =moment(new Date()).format("YYYYMMDD");
   //减去七天时间
  var date =moment(new Date()).subtract(7, 'days').format("YYYYMMDD");
   
   console.log(date);
  console.log(currentDate); 
   
    var  arg = JSON.parse(Param.body.toString());
     var params  ={
          "input": {
            "channelSerialNo":  "213332323",
            "currUsrId": arg.userId,
            "domain": "400",
            "extendMap": {
              "entry": {
                "Key": "",
                "Value": ""
              }
            },
            "bussType": "ITS",
            "beginDate": "",
            "endDate": ""
          }
        };
    
    var option ={
        method: 'POST',
       // url: global.baseURL + '/docPlatform/PORTALBPMIAIWaitTaskSumImplBean',
       url:"http://10.10.1.152/docPlatform/PORTALBPMIAIWaitTaskSumImplBean",
        Body: params,
        Cookie : "true"
    };
    
    MEAP.AJAX.Runner(option, function(err, res, data) {
        
        
        console.log(data);
        var data =JSON.parse(data);
            if(data.output){
            
              if(data.output.taskList){
               
                 
                   if(data.output.taskList instanceof Array ){
                      
                        var countArr = _.pluck(data.output.taskList, 'taskNum');
                    var count = _.reduce(countArr, function(a,b){return parseInt(a,10)+parseInt(b,10)});
                       console.log("count: "+count);
                       console.log("it array!!");
                   }
                    
              }else{
                 
                 //结果为0
                  console.log("task==null");
              }
               
            }else{
                //结果出错
                console.log(5555);
            }
    });
}

exports.Runner = run;