var MEAP=require("meap");
var path = require("path");
var cttqUtil = require("cttqUtil");

function run(Param,Robot,Request,Response,IF)
{
	 var requestTime = Date.now();
    var arg = JSON.parse(Param.body.toString());
    var option={
        wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"zbcmwsforios63.xml"),
        func:"ZBCMWSFORIOS63.ZBCMWSFORIOS63.ZBCMFORIOS63",
        Params:arg,
        agent:false
    };
	
	 var invokeTime = Date.now();
    MEAP.SOAP.Runner(option,function(err,res,data){
		var completeTime = Date.now();
        Response.setHeader("Content-type","text/json;charset=utf-8");
        if(!err)
        {
            Response.end(JSON.stringify(data));
			var responseTime = Date.now();
            var handleRequestTimes = invokeTime - requestTime;
            var invokeInterfaceTimes = completeTime - invokeTime;
            var handleResultTimes = responseTime - completeTime;
            var totalTimes = responseTime - requestTime;
            var interfaceName = IF.type + "/" + IF.path;
            var userId = arg.IS_PUBLIC.ORIGINATETELLERID;
            var runtimeArg = {
                "userId" : userId,
                "interfaceName" : interfaceName,
                "requestTime" : requestTime,
                "invokeTime" : invokeTime,
                "completeTime" : completeTime,
                "responseTime" : responseTime,
                "handleRequestTimes" : handleRequestTimes,
                "invokeInterfaceTimes" : invokeInterfaceTimes,
                "handleResultTimes" : handleResultTimes,
                "totalTimes" : totalTimes
            };
            cttqUtil.analyInterfaceRunTimes(runtimeArg, function(err, data) {
				console.log(err,data);
            });
        }
        else
        {
            Response.end(JSON.stringify({status:'-1',message:'Error'}));
        }
    });
}

//******** debug start ********
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var visitLogObj = {
    type: "webService", // �ӿ�����
    module: "",// �ӿ�ģ��
    name: "", // �ӿ����
    status: "", // �ӿ�����״̬ 0���ɹ� 1��ʧ��
    beforeTime: 0, // ����ӿ�ǰʱ���
    afterTime: 0, // �ӿڷ��ص�ʱ���
    queryParam: ""// ��ѯ����
};
//��¼ҳ�������(analy_page_visit_log)
var webServiceLogSchema = new Schema({
    type: String, // �ӿ�����
    module: String,// �ӿ�ģ��
    name: String, // �ӿ����
    status: Number, // �ӿ�����״̬ 0���ɹ� 1��ʧ��
    beforeTime: Number, // ����ӿ�ǰʱ���
    afterTime: Number, // �ӿڷ��ص�ʱ���
    queryTime: Number, // �ӿ�
    queryParam: String, // ��ѯ����
    createTime: Number//����ʱ��
});

function saveVisitLog() {
    var conn = mongoose.createConnection(global.mongodbURL);
    var webServiceLogModel = conn.model("web_service_log", webServiceLogSchema);
    // Schema�����˵��
    var webServiceLog = new webServiceLogModel({
        type: visitLogObj.type, // �ӿ�����
        module: visitLogObj.module,// �ӿ�ģ��
        name: visitLogObj.name, // �ӿ����
        status: visitLogObj.status, // �ӿ�����״̬ 0���ɹ� 1��ʧ��
        beforeTime: visitLogObj.beforeTime, // ����ӿ�ǰʱ���
        afterTime: visitLogObj.afterTime, // �ӿڷ��ص�ʱ���
        queryTime: visitLogObj.afterTime - visitLogObj.beforeTime, // �ӿ�
        queryParam: visitLogObj.queryParam, // ��ѯ����
        createTime: new Date().getTime()//����ʱ��
    });
    webServiceLog.save(function (err, data) {
        conn.close();
    });
}
//******** debug end ********

exports.Runner = run;
