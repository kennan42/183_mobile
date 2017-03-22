var MEAP=require("meap");

function run(Param, Robot, Request, Response, IF)
{ 
   var body ={};
    if (Param.body != null) {
        body = JSON.parse(Param.body.toString());
    }
   
    var option = {
        method : "POST",
        url :  global.ideuwx + "/iedu/exam/getUserScore.json",
        Cookie : "true",
        Enctype:"application/x-www-form-urlencoded",
        Body : body.data,
        Headers :  {
            //cookie:Request.headers.cookie
            cookie:body.cookie
		   // cookie:'JSESSIONID=6635e789-4ce1-416e-a731-ce7ad501da21; Path=/iedu; HttpOnly'
            }
    };
 
    MEAP.AJAX.Runner(option, function(err, res, data) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err) {
            Response.end(data);
        } else {
            Response.end(JSON.stringify({
                status : '1',
                message : JSON.stringify(err)
            }));
        }
    }, Robot);
}

exports.Runner = run;


                                

	

