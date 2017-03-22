var MEAP = require("meap");
var sqlMaps = require("../sqlMap/init_sqlMap.js");
global.sqlMaps = sqlMaps;

// HR相关接口的用户名密码
global.TXSOAPAuth = {username: "hrws", password: "123456"};
// HANA相关接口的用户名密码
global.HanaAuth = {username: "CTTQ_APP", password: "Hana_app_2014"};
//HANA-dev
global.baseHANA= "http://10.10.1.104:8000";
// xml 文件目录
global.wsdl = "wsdl_dev";
global.wsdl2 = "wsdl_dev900";

// 单点登录认证地址（PC)）
global.ntlm_url = "http://10.10.1.182:11130/ntlm/check.jsp";

global.mongodbURL = "mongodb://mobile:mobile_1234@10.10.1.183:27017/mobile";
global.nginxURL = "http://218.92.66.228:8888/";
// EMM 消息推送地址
global.pushURL = "http://10.10.1.183:8080/push/msg/sendMessage";
//global.pushURL = "http://10.10.1.183:8080/push/msg/sendSingleMessage";

// 天信的 AppID
global.appId = "aaaah10013";
// MAS 接口地址
global.baseURL = "http://10.10.1.183";
// EMM 接入服务器地址
global.appInURL = "http://10.10.1.183:8080";

// HANA
global.hanaConfig = {
    "url": "jdbc:sap://hanadev.cttq.com:30015?reconnect=true",
    "user": "CTTQ_APP",
    "password": "Hana_app_2014",
    "libpath": "/opt/emm/lib/ngdbc.jar",
    "drivername": "com.sap.db.jdbc.Driver"
};

// MAS 连接 Redis 的端口和地址
global.redisPort = 6379;
global.redisHost = "10.10.1.183";

// EMM 连接 Redis 的端口和地址
global.emmRedisHost = "10.10.1.182";
global.jpushAuth = "";
global.liveTime=864000;
global.mainAppId = "dss140843969510001";
global.pushType="emm";

// MAS 手机端认证授权,有效期10天
global.liveTime=864000;
// 应用商店 ID
global.mainAppId = "dss140843969510001";
// 推送消息类型
global.pushType="jpush";

//mas调用java接口地址
global.masJavaWebURL = "http://10.10.1.182:11130/masJavaWeb";

//全局域名配置
global.domain = "http://aidev.cttq.com"
function run(Param, Robot, Request, Response, IF) {

    Response.end();
}

// IT服务和天知道接口前缀
global.its = "http://hdev01.cttq.com";
global.iknow = "http://hdev01.cttq.com";

//新员工成长培训项目
global.train = "http://cttqdev.cttq.com:8000";
global.portal = "http://cpd.cttq.com:50000";

// AD域
// 用户名:cttq  密码:cttq123.com


//考试接口
//global.ideuwx="http://120.26.111.54:6100";

//global.ideuwx="http://yixan.f3322.net";
global.ideuwx="http://121.40.171.99:6100";

//微信
global.wx_bcard_get_userinfo="http://qxnwtest.cttq.com/tqsite/oath2/mobile/draw/getinfo";
//global.appID = "wxe424f85b0b207126";
//global.appsecret = "c41acd337ad8bc541d7e5df1d9215222";
global.appID = "wxc33ccb654e701121";
global.appsecret = "ee6d52aefe6244f1f1c18af331dd303e";

//环信配置
global.easemob = {
	clientId:"YXA6BuObcL3dEeWaUTkzBbBu8w",
	clientSecret:"YXA61fUm-wHR_2Mzrgb9LmtJpvcIhTI",
    orgName : "cttq",
    appName : "aidev01"
};


//jpush
global.jpush ={
     appKey : "868c28217f56268a58b72e62",
     MasterSecret :"189289c71ec7ff4bc8fbafc8" 
};


global.zabbix={
    user:"Admin",
    password: "zabbix",
    url :"http://192.168.2.94/api_jsonrpc.php"
    
}


//阿里大于
global.sms = {
    appkey : "23446568",
    appsecret : "9b0472a38303149af3a5066588d53dd7",
    url:"http://gw.api.taobao.com/router/rest"

}

//cms地址
global.cms ="http://cmsdev2.cttq.com";

exports.Runner = run;
