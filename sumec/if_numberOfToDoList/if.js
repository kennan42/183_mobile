var MEAP=require("meap");

function run(Param, Robot, Request, Response, IF)
{
    var params = Param.params;
    var userId = params.userId;//审批人工号
    
    
    Response.end(JSON.stringify({status:0, message:"Success"})); 
}

exports.Runner = run;