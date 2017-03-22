var API_KEY = "sk_test_4SiP84Durb9810KGqLPCqrD8" // 这里填入你的 Test/Live Key

var MEAP=require("meap");
var pingpp = require('pingpp')(API_KEY);
function run(Param, Robot, Request, Response, IF)
{
    var oauthUrl = pingpp.wxPubOauth.createOauthUrlForCode('wx34b4baa076ca68b9', 'http://aidev.cttq.com/pay/getopenid?showwxpaytitle=1');
    Response.writeHead(302, {
        "Location": oauthUrl
    });
    Response.end('');
	
}

exports.Runner = run;


                                

	

