var MEAP=require("meap");

function run(Param, Robot, Request, Response, IF)
{
	
	var option={
		method : "GET",
		url : "",
		Cookie : "true"
	};
	
	MEAP.AJAX.Runner(option,function(err,res,data){
	    if(!err)
	    {
			//Add your normal handling code
	    }
	    else
	    {
			//Add your exception handling code 
	    }
	},Robot);
}

exports.Runner = run;


                                

	

