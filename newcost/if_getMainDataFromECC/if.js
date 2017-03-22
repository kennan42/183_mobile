var MEAP=require("meap");
var mongoose = require("mongoose"); 
var maindataschema = require("../dataSchema.js");


/**
 * 从ecc获取主数据
 * 手动调接口的时候会从ecc获取数据并存到数据库中，下次再调接口时替换数据，版本号对应加1
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
	var arg = JSON.parse(Param.body.toString()); 
   var db = mongoose.createConnection(global.mongodbURL);
    var maindataModel = db.model("main_datas", maindataschema.MainDataSchema);
	var  ifAT = arg.ifAT; 
	if(ifAT==0){//从ecc获取数据并存到数据库中 
       getmiandata(Param, Robot, function (err, res){//把数据存到数据库中   
           if(!err){ 
               maindataModel.find({"code":1},{"code":1,"version":1},function(errx,data){
                   if(!errx){
                       if(data.length==0){
                           var maindataEntity = new maindataModel(
                         {
                             code:1,//编号
                             version:1,//版本号
                             datas:res,//主数据 
                             datatime:new Date().getTime(),
                             eccversion:res.E_ZVERSION
                          } );
                    maindataEntity.save(function(err, doc) { 
                     db.close(); 
                    if (!err) {
                           Response.end(JSON.stringify({
                           status : 0,
                           msg : '主数据同步成功'
                          })); 
                     } else {
                           Response.end(JSON.stringify({
                           status : -1,
                           msg : '数据同步失败'
                     }));
                       }
                        });  
                       }else{ 
                           var verss = data[0].version+1;
                         maindataModel.update({"code":1},{"version":verss,"datas":res,"datatime":new Date().getTime(),"eccversion":res.E_ZVERSION}).exec(function(err,data){
                              db.close();
                       if(!err){
                          Response.end(JSON.stringify({
                              status:0,
                              msg:"数据更新成功"
                          }));
                      }else{
                          Response.end(JSON.stringify({
                              status:-1,
                              msg:"数据更新失败"
                          }));
                           }
                         }
                             );  
                       }
                   }else{
                    Response.end(JSON.stringify({
                        "status":-1,
                        "msg":"更新数据失败"
                    }));   
                   }
               });
               
                
              
           }else{
               Response.end(JSON.stringify({
                status : -1,
                msg : '调用ecc接口失败'
            })); 
           } 
       });  
	}else{  
         var vers = arg.version;
         //先查询是否有该版本号，存在就告诉前端存在改值不需要更新。否则就把值传给前端
         maindataModel.find({"version":vers},{"version":1},function(errx,data){ 
             if(!errx){
                if(data.length==0){
                   maindataModel.find({"code":1},{"datas":1,"version":1},function(err,res){
                       db.close();  
        if(!err){ 
            Response.end(JSON.stringify({
                "status" : "0",
                "msg" : "查询成功",
                "data" :res[0].datas,
                "version" :res[0].version
            }));
        }else{
             Response.end(JSON.stringify({
               "status" : "1",
                "msg":"数据未同步"
            }));
              }
           }); 
                } else{
             Response.end(JSON.stringify({
               "status" : "1",
                "msg":"数据未同步"
            }));
                }
             }else{
                 db.close();  
                  Response.end(JSON.stringify({
                    "status" : "-1",
                    "msg":"查询失败"
            }));
             }
         }); 
	    
	}  
}
 
function getmiandata(Param, Robot, cb) { 
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
      "ZVERSION": "19000710074105"
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


                                

	

