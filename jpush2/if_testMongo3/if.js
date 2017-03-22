var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var baseSchema = require("../BasePushSchema.js");


function run(Param, Robot, Request, Response, IF)
{    
    
    console.log(111);
   
            
     console.log(22222);
     
     var db=mongoose.createConnection(global.mongodbURL);
     console.log(3333);
     var messageModel=db.model("msgLog",baseSchema.msgLogSchema);
     console.log(444);
     
     
   //  messageModel.find({"userList":{'$all':[{"status":0,"uid":"8222"}]}},{_id:0}).exec(function (err,data){
      messageModel.find({status:0,uid:"8333",msgType:"bx"}).exec(function(err,data){
      
      
         db.close;
         console.log(  JSON.stringify(data) )  ;
          if(!err){
              
              Response.end(JSON.stringify({
                  res: data
                  
              }));
              
          }else{
              Response.end(JSON.stringify({
                  res: "err"
                  
              }));
              
          }
        
        
         
     });
     
     
    // appInstallModel.find({receveMsg:1},{userId:1,_id:0}).exec(function(err,data){
/*
messageModel.find({userList.uid:"8103666"},{_id:0}).exec(function(err,data){      
          db.close;
          Response.setHeader("Content-type","text/json;charset=utf-8");
         if(!err){
             
              Response.end(JSON.stringify({
                status:0,
                msg:"鏌ヨ鎴愬姛",
                receveMsg:data
            }));
         }else{
             Response.end(JSON.stringify(
                 {
                     status:1,
                     msg:"鏌ヨ澶辫触"
                     
                 }
             ));
             
         }
         
     });*/

     
          
}

exports.Runner = run;


                                

    

