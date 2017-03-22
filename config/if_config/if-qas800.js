/**
 * 废弃不用
 */
var MEAP=require("meap");

global.TXSOAPAuth = {username:"HRWS",password:"cttq2012"};
global.wsdl = "wsdl_test";
global.ntlm_url = "http://10.10.1.151:11130/ntlm/check.jsp";
global.mongodbURL = "mongodb://mobile:mobile_1234@10.10.1.152:27017/mobile";
global.nginxURL = "http://aiqas.cttq.com:8888/";
//global.pushURL = "http://10.10.1.152:8080/push/msg/sendMessage";
global.pushURL = "http://10.10.1.152:8080/push/msg/sendSingleMessage";
global.appId = "aaaao10003";
global.baseURL = "http://10.10.1.152";
global.appInURL = "http://10.10.1.152:8080";
global.hanaURL = {host :"10.10.1.104",port : 31115,user : "CTTQ_HR",password : "Hana_hr_2014"};
global.redisPort = 6379;
global.redisHost = "10.10.1.152";
global.emmRedisHost = "10.10.1.151";
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