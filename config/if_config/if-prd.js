var MEAP = require("meap");

global.TXSOAPAuth = {username: "hrws", password: "*#!cttqszm"};
global.wsdl = "wsdl_pro";
global.ntlm_url = "http://10.10.1.149:11130/ntlm/check.jsp";
global.mongodbURL = "mongodb://10.10.1.147:27017,10.10.1.148:27017,10.10.1.149:27017/mobile";
global.nginxURL = "http://ai.cttq.com:8888/";
global.pushURL = "http://ai.cttq.com:8080/push/msg/sendSingleMessage";
global.appId = "10000003";
global.redisHost = "10.10.1.147";
global.redisPort = 6379;
global.emmRedisHost = "10.10.1.147";
global.baseURL = "http://ai.cttq.com:1443";
global.appInURL = "http://10.10.1.145:8080";
global.hanaConfig = {
    "url": "jdbc:sap://hanaprd.cttq.com:30015?reconnect=true",
    "user": "CTTQ_HR",
    "password": "HANA_haphr_2015",
    "libpath": "/opt/emm/lib/ngdbc.jar",
    "drivername": "com.sap.db.jdbc.Driver"
};
global.liveTime = 864000;
global.pushType = "emm";
global.mainAppId = "sdk100000";
//微信
global.appID = "wx42228f4ebb459ca2";
global.appsecret = "d4624c36b6795d1d99dcf0547af5443d";
function run(Param, Robot, Request, Response, IF) {

    Response.end();
}

exports.Runner = run;