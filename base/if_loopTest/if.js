var MEAP=require("meap");

function run(Param, Robot, Request, Response, IF)
{
    /*
    var option = {
        url:global.baseURL + "/base/test",
        method:"GET"
    };
    for(i=0;i<3000;i++){
        MEAP.AJAX.Runner(option,function(err,res,data){
            console.log("over--->",i);    
        });
    }	
    */
    Response.end("/base/loopTest");
}

exports.Runner = run;


                                

	

