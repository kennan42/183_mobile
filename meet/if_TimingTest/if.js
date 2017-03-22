var MEAP=require("meap");
var later = require('later');
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js"); 

/**
 * 定时器测试
 * 定时查询与会人员信息，与会人员的消息推送，
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param, Robot, Request, Response, IF)
{
     var num =10;
     console.log(num.toFixed(2));
     Response.end(JSON.stringify({
       num:  num.toFixed(2)
     }));
}

/**
 * 定时
 */
 function dingshi(Param, year,month,day,hour,minute,userId){
     
 console.log("员工工号:"+userId);
var time ={Y:[year],M:[month],D:[day],h:[hour],m:[minute],s:[1]} 
var composite=[//组合时间表
    time
]
var sched={
    schedules:composite
};
later.date.localTime();  //设置本地时区 
var t=later.setTimeout(function(){
    var db = mongoose.createConnection(global.mongodbURL);
    var meetBookModel = db.model("meetBook", sm.MeetBookSchema); 
   meetBookModel.find({"_id":meetBookId}).exec(function(err,data){
         db.close();
       if(!err){
           //根据state状态来判断是否推送消息及推送什么消息
           //（state：1（审核中），state：2（预定成功），state：3(驳回)，state：4（取消））
          if(data.state==1){//审核中
              
          }else if(data.state==2){//预定中
              
          }else if(data.state==3){//驳回
              
          }else if(data.state==4){//取消
              
          }
          
              console.log(JSON.stringify({
                status:0,
                msg:"成功",
                data:data
           }));
            
        }else{
          console.log(JSON.stringify({
              status:-1,
              msg:"失败"
          }));  
        }
    });  
},sched);
      
}
 
exports.Runner = run;


                                

	

