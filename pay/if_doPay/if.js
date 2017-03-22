var API_KEY = "sk_test_4SiP84Durb9810KGqLPCqrD8" // 这里填入你的 Test/Live Key
var APP_ID = "app_Kqnrb5uTur9KnXHK" // 这里填入你的应用 ID


var MEAP=require("meap");
var crypto = require('crypto');
var pingpp = require('pingpp')(API_KEY);
function run(Param, Robot, Request, Response, IF)
{
	Response.setHeader("Content-Type", "text/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var amount = arg.amount;
    
    var channel = arg.channel;
    
    // 设置你的私钥路径，用于请求的签名，对应的公钥请填写到 Ping++ 管理平台
    pingpp.setPrivateKeyPath(__dirname + "/rsa_private_key.pem");
    var order_no = crypto.createHash('md5')
              .update(new Date().getTime().toString())
              .digest('hex').substr(0, 16);
    var client_ip = Request.connection.remoteAddress;
    console.log(client_ip);
    pingpp.charges.create({
        subject: "Your Subject",                    //商品的标题
        body: "Your Body",                          //商品的描述信息
        amount: amount,                             //订单总金额, 单位为对应币种的最小货币单位，例如：人民币为分（如订单总金额为 1 元，此处请填 100）。
        order_no: order_no,                      //商户订单号，适配每个渠道对此参数的要求，必须在商户系统内唯一
        channel: channel,
        currency: "cny",
        client_ip: client_ip,
        app: {id: APP_ID}
    }, function(err, charge) {
        if(err){
            Response.end(JSON.stringify({
                "status": "-1",
                "msg": err
            }));
        }else{
            Response.end(JSON.stringify({
                "status": "0",
                "charge": charge
            }));
        }
    });
}

exports.Runner = run;


                                

	

