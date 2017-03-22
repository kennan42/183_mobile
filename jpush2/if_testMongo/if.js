var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../app_install.js");


function run(Param, Robot, Request, Response, IF)
{    
    
	
	 var con=JSON.parse(Param.body.toString());
	 console.log("con:"+con);
	 
	 var db=mongoose.createConnection(global.mongodbURL);
	
     var appInstallModel=db.model("app_install",sm.installedAppSchema);
     
    // appInstallModel.find({receveMsg:1},{userId:1,_id:0}).exec(function(err,data){
appInstallModel.find().exec(function(err,data){      
          db.close;
          Response.setHeader("Content-type","text/json;charset=utf-8");
         if(!err){
             
              Response.end(JSON.stringify({
                status:0,
                msg:"查询成功",
                receveMsg:data
            }));
         }else{
             Response.end(JSON.stringify(
                 {
                     status:1,
                     msg:"查询失败"
                     
                 }
             ));
             
         }
         
     });
     
          
          
}

exports.Runner = run;


                                

	

