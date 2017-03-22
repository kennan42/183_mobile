var MEAP=require("meap");
var mongoose = require("mongoose"); 
var maindataschema = require("../dataSchema.js");


/**
 * 定时任务:使用crontab来定时运行
 * 从ecc获取主数据 更新数据
 * app端传参版本号过来的时候，对比版本号是否变化，有变化就传新的数据回去，没有就不返回具体数据
 * 入参：是否手动(0为手动，1为自动)，版本号
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param, Robot, Request, Response, IF)
{    
     Response.setHeader("Content-type", "text/json;charset=utf-8"); 
     var db = mongoose.createConnection(global.mongodbURL);
     var maindataModel = db.model("main_datas", maindataschema.MainDataSchema);
      maindataModel.find({"code":1},{"code":1,"version":1,"eccversion":1},function(errx,data){
                   if(!errx){
                       if(data.length==0){
                           getmiandata1("19000710074105", Robot, function (err, res){//把数据存到数据库中   
                             if(!err){ 
                            var maindataEntity = new maindataModel(
                                 {
                                   code:1,//编号
                                   version:1,//版本号
                                   datas:res,//主数据 
                                   datatime:new Date().getTime(),
                                   eccversion:res.E_ZVERSION
                                  });
                             maindataEntity.save(function(err, doc) { 
                              db.close(); 
                             if (!err) {
                                 Response.end(JSON.stringify({msg:"主数据同步成功"})); 
                                 console.log(new Date()+"主数据同步成功");
                                 /*
                               Response.end(JSON.stringify({
                                  status : 0,
                                  msg : '主数据同步成功'
                                 }));
                                  */
                              } else {
                                  Response.end(JSON.stringify({msg:"数据同步失败"}));  
                                  console.log("数据同步失败"); 
                                }
                                  });  
                                  }else{
                                      Response.end(JSON.stringify({msg:"调用ecc接口失败3"})); 
                                      console.log("调用ecc接口失败3"); 
                                            } 
                                        }); 
                            
                       }else{  
                            var verss = data[0].version+1;
                            getmiandata1(data[0].eccversion, Robot, function (err, res){//把数据存到数据库中   
                               if(!err){
                                   //获取res.ET_PUBLIC.item的值，看数组有几个值
                                   var flag = false;
                                   for(var x=0;x<res.ET_PUBLIC.item.length;x++){
                                       if(res.ET_PUBLIC.item[x].TOTALSIZE!="000000"){
                                         flag = true; 
                                         break; 
                                       }
                                   } 
                                   if(flag){
                                       getmiandata1("19000710074105", Robot, function (err1, resxx){//把数据存到数据库中   
                            console.log(resxx);
                             if(!err1){
                                 console.log(resxx);
                                 maindataModel.update({"code":1},{"version":verss,"datas":resxx,"datatime":new Date().getTime(),"eccversion":res.E_ZVERSION}).exec(function(err,data){
                                        db.close();
                                        if(!err){
                                             Response.end(JSON.stringify({msg:"数据更新成功"}));  
                                             console.log("数据更新成功");
                                      /* Response.end(JSON.stringify({
                                       status:0,
                                       msg:"数据更新成功"
                                       }));
                                         */
                                             }else{
                                                  Response.end(JSON.stringify({msg:"数据更新失败"}));  
                                                  console.log("数据更新失败");
                                     /* Response.end(JSON.stringify({
                                        status:-1,
                                        msg:"数据更新失败"
                                      }));
                                        */
                                               }
                                             }); 
                                  
                                  }else{
                                      Response.end(JSON.stringify({msg:"调用ecc接口失败3"})); 
                                      console.log("调用ecc接口失败3");
                                       
                                            } 
                                        });      
                                      }else{
                                         Response.end(JSON.stringify({msg:"没有数据要跟新"}));
                                         console.log("没有数据要跟新"); 
                                      } 
                                    }else{
                                        Response.end(JSON.stringify({msg:"调用ecc接口失败2"})); 
                                        console.log("调用ecc接口失败2"); 
                                      }  
                              });  
                       }
                   }else{
                        Response.end(JSON.stringify({msg:"更新数据失败"})); 
                       console.log("更新数据失败");
                   /* Response.end(JSON.stringify({
                        "status":-1,
                        "msg":"更新数据失败"
                    })); 
                    */  
                   }
               }); 
}
 
function getmiandata1(ZVERSION, Robot, cb) {  
    var  newdata; 
    var option = {
        method: "POST",
        url: global.baseURL + "/newcost/ZBCMBCODEFORAI14",
        Cookie: "true",
        agent: "false",
        Enctype: "application/json",
        Body: JSON.stringify({
      "IS_PUBLIC": {
      "CHANNELSERIALNO": "",
      "ORIGINATETELLERID": "",
      "ZDOMAIN": "400",
      "I_PAGENO": "",
      "I_PAGESIZE": "",
      "ZVERSION": ZVERSION
    },
    "IT_EXTENDMAP": {
      "item": {
        "FIELDNAME": "",
        "VALUE": ""
      }
    },
    "I_APPID": "G"
  }) 
    }; 
    MEAP.AJAX.Runner(option, function (err, res, data) {  
      cb(err,JSON.parse(data));  
    }, Robot);
     
}
 
exports.Runner = run;
 