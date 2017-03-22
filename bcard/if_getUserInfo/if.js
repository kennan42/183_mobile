var MEAP=require("meap");

/**
 * 查询用户信息
 * @author donghua.wang
 * @date 2016年1月17日 11:08
 * */
function run(Param, Robot, Request, Response, IF)
{
	console.log("bcard.getUserInfo start");
	Response.setHeader("Content-Type","text/json;charset=utf-8");
	var arg = JSON.parse(Param.body.toString());
	var tokenId = arg.tokenId;
	var app = arg.app;
	var userId = arg.userId;
	var url = global.wx_bcard_get_userinfo + "?tokenId=" + tokenId + "&app=" + app + "&userId=" + userId;
	var option={
		method : "GET",
		url : url,
		Cookie : "true",
		agent:false
	};
	
	MEAP.AJAX.Runner(option,function(err,res,data){
	    if(!err && data != null)
	    {
			Response.end(JSON.stringify({
			    "status":"0",
			    "msg":"查询用户信息成功",
			    "data":JSON.parse(data)
			}));
	    }
	    else
	    {
			Response.end(JSON.stringify({
                "status":"-1",
                "msg":"查询用户信息失败"
            }));
	    }
	},Robot);
}

exports.Runner = run;


                                

	

