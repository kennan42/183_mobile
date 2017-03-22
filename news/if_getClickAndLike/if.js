var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../newsSchema.js");
var async = require("async");

/**
 获取点击点赞和收藏

 接口已经取消不用

**/

var db =null;
//var arg=null;
//var cid =null;
//var userId =null;

function run(Param, Robot, Request, Response, IF) {

     var arg = JSON.parse(Param.body.toString());
     var cid = arg.cid;
     var userId =arg.userId;
     var  number_click=0;
     var number_like=0;
     var likeStatus =0;    //是否点赞
     var collectStatus =0;  //是否收藏
     db = mongoose.createConnection(global.mongodbURL);
    
     main(Response,arg,cid,userId);
    
    
    


   
   

}

function   main(Response,arg,cid,userId){
    var test1= getNewsClicks.bind(null,arg);
     var test2= getNewsLikeStatus.bind(null,arg);
      var test3= getNewsCollectStatus.bind(null,arg);
    
    async.parallel([test1,test2,test3],function(err,data){
        Response.setHeader("Content-type","text/json;charset=utf-8");
        db.close();
        
        
        
        
        
        if(!err){
              if(null!=data[0]&&null!=data[0].number_click){
          
                number_click=data[0].number_click;
            }else{
                number_click=0;
            }
            if(null!=data[0]&&null!=data[0].number_like){
               
                number_like=data[0].number_like;
            }else{
                number_like=0;
            }
            
            if(null!=data[1]&&null!=data[1].status){
                likeStatus =data[1].status;
            }else{
                likeStatus=0;
            }
			console.log("-----------------");
            console.log(data[2]);
            if(null!=data[2]&&null!=data[2].status){
                collectStatus =data[2].status;
            }else{
                collectStatus=0;
            }
            
            
            Response.end(JSON.stringify({
                status : 0,
                message : "Success",
                data:{
                    cid:arg.cid,
                    number_click:number_click,
                    number_like:number_like ,
                    likeStatus:likeStatus,
                    collectStatus:collectStatus
                } 
                
            }));
        }else{
            Response.end(JSON.stringify({
                status : -1,
                message : "err"
            }));
        }
    });
    
}

//获取阅读数和点赞总数
function getNewsClicks(arg,callback){
    console.log(111111);
    console.log(arg);
    var newsModel = db.model("newsClick", sm.NewsClickSchema);
     newsModel.findOne({cid:arg.cid},{_id:0,cid:-1,number_like:-1,number_click:-1}).exec(function(err, data) {
       console.log("getNewsClicks",data);
        callback(err,data);

    });

    
}

//查询是否点赞
function  getNewsLikeStatus(arg,callback){
    
     var newsLikeModel = db.model("newsLike", sm.NewsLikeSchema);
     newsLikeModel.findOne({"cid":arg.cid,userId:arg.userId},{"status":-1}).exec(function (err,data){
       
           callback(err,data);
        
     });
    
}


//查询是否收藏
function getNewsCollectStatus(arg,callback){
    
   var myCollectModel = db.model("myCollect", sm.MyCollectSchema);
    
    myCollectModel.findOne({"cid":arg.cid,userId:arg.userId},{"status":-1}).exec(function(err,data){
        callback(err,data);
    });
    
}





exports.Runner = run; 