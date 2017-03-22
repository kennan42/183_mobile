var MEAP=require("meap");
var sha1 = require("sha1");


function run(Param, Robot, Request, Response, IF)
{
    var AppKey = "82hegw5uh927x";
    var NONCE = parseInt( Math.random() * 0xffffff );
    var APPSECRET = "gcoT8UQ8JEk";
    var TIMESTAMP = Date.parse( new Date() );
    var SIGNATURE = sha1( APPSECRET + NONCE + TIMESTAMP  );
    
     var option={
        method : "POST",
        url : "https://api.cn.rong.io/group/create.json",
        Body:{
            userId:"888888",
            groupId:"888888",
            groupName:"888888"
        },
        Headers:{
          "App-Key":AppKey,
          "Nonce":NONCE,
          "Timestamp":TIMESTAMP,
          "Signature":SIGNATURE
        },
        Enctype:"application/x-www-form-urlencoded"
    };
    
    MEAP.AJAX.Runner(option,function(err,res,data){
        if(!err)
        {
           Response.end(data);
        }
        else
        {
            Response.end("fail");
        }
    });
	
   
}

exports.Runner = run;


                                

	

