var MEAP=require("meap");

function run(Param, Robot, Request, Response, IF)
{
    //Add your normal handling code 
    Response.end(JSON.stringify({status:0, message:"Success"})); 
}

exports.Runner = run;