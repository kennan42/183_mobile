
var MEAP=require("meap");

function run(Param, Robot, Request, Response, IF)
{
	var arg = Param.params;
	console.log("code"+arg.code)
	var url = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx34b4baa076ca68b9&secret=fe81e6bd4ca458c9d5d4b98711d32005&code="+arg.code+"&grant_type=authorization_code"
	var option={
        method : "GET",
        url : url,
        Cookie : "true"
    };
    
    MEAP.AJAX.Runner(option,function(err,res,data){
        if(!err)
        {
            res.send(JSON.stringify(data));
        }
        else
        {
            //Add your exception handling code 
        }
    },Robot);
}

exports.Runner = run;


                                

	

