var MEAP=require("meap");

global.TXSOAPAuth = {username:"HRWS",password:"hrws2015"};
global.wsdl = "wsdl_qas900";
global.ntlm_url = "http://10.10.1.151:11130/ntlm/check.jsp";
global.mongodbURL = "mongodb://mobile:mobile_1234@10.10.1.152:27017/mobile";
global.nginxURL = "http://aiqas.cttq.com:8888/";
//global.pushURL = "http://10.10.1.152:8080/push/msg/sendMessage";
global.pushURL = "http://10.10.1.152:8080/push/msg/sendSingleMessage";
global.appId = "aaaao10003";
global.redisHost = "10.10.1.152";
global.redisPort = 6379;
global.emmRedisHost = "10.10.1.151";
global.baseURL = "http://10.10.1.152";
global.appInURL = "http://10.10.1.152:8080";
global.pushType="emm";
global.hanaConfig = {
    "url" : "jdbc:sap://hanaqas.cttq.com:31115?reconnect=true",
    "user" : "CTTQ_HR",
    "password" : "Hana_hr_2014",
    "libpath" : "/opt/emm/lib/ngdbc.jar",
    "drivername" : "com.sap.db.jdbc.Driver"
};
global.liveTime=864000;
global.mainAppId="dss140843969510001";
//微信
global.appID = "wx42228f4ebb459ca2";
global.appsecret = "d4624c36b6795d1d99dcf0547af5443d";

//环信配置
global.easemob = {
    clientId:"YXA6ZHoE4J2eEeWEO_fUHV3ZDQ",
    clientSecret:"YXA6Kg3Ax1w6-oDX2rMnXk5ol8sEmBI",
    orgName : "cttq",
    appName : "aiqas"
};

function run(Param, Robot, Request, Response, IF)
{

    Response.end();
}

exports.Runner = run;
