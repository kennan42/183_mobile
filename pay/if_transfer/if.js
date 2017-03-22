var MEAP=require("meap");
var crypto = require('crypto');

var API_KEY = "sk_test_4SiP84Durb9810KGqLPCqrD8" // 这里填入你的 Test/Live Key
var APP_ID = "app_Kqnrb5uTur9KnXHK" // 这里填入你的应用 ID
var pingpp = require('pingpp')(API_KEY);

function run(Param, Robot, Request, Response, IF)
{
    Response.setHeader("Content-Type", "text/json;charset=utf8");
	var arg = JSON.parse(Param.body.toString());
	var amount = arg.amount;
    var openid = arg.openid;
     var order_no = crypto.createHash('md5')
              .update(new Date().getTime().toString())
              .digest('hex').substr(0, 16);
              
    // 设置你的私钥路径，用于请求的签名，对应的公钥请填写到 Ping++ 管理平台
    pingpp.setPrivateKeyPath(__dirname + "/rsa_private_key.pem");          
    pingpp.transfers.create({
      order_no:    order_no,
      app:         { id: APP_ID },
      channel:     "wx_pub",
      amount:      amount,
      currency:    "cny",
      type:        "b2c",
      recipient:   openid,
      description: "Your Description"
    }, function(err, transfer) {
       if(err){
            Response.end(JSON.stringify({
                "status": "-1",
                "msg": err
            }));
        }else{
            Response.end(JSON.stringify({
                "status": "0",
                "transfer": transfer
            }));
        }
    });
}

exports.Runner = run;


                                

	

