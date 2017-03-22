/*------------------------------------------------------------
 // Copyright (C) 2015 正益无线（北京）科技有限公司  版权所有。
 // 文件名：if.js
 // 文件功能描述：  驳回数量查询,封装了该接口
 //
 // 创 建 人：杨尚飞
 // 创建日期：2015.12.24
 //
 // 修 改 人：
 // 修改日期：
 // 修改描述：
 //-----------------------------------------------------------*/

var MEAP = require("meap");
var path = require("path");
var cttqUtil = require("cttqUtil");

function run(Param, Robot, Request, Response, IF) {
	var requestTime = Date.now();
    var arg = JSON.parse(Param.body.toString());
    var option = {
        //wsdl:"http://bmd.cttq.com:51200/EM_CMB_AIRBTaskSumQry/EMCMBAIRBTaskSumQryImplBean?wsdl",
        wsdl : path.join(__dirname.replace(IF.name, ""), global.wsdl2, "EMCMBAIRBTaskSumQryImplBean.xml"),
        func : "EM_CMB_AIRBTaskSumQry.EM_CMB_AIRBTaskSumQry_Port.EMCMBAIRBTaskSumQry",
        Params : arg,
        agent : false
    };
	var invokeTime = Date.now();
    MEAP.SOAP.Runner(option, function(err, res, data) {
		var completeTime = Date.now();
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err) {
            Response.end(JSON.stringify(data));
			var responseTime = Date.now();
			var handleRequestTimes = invokeTime - requestTime;
			var invokeInterfaceTimes = completeTime - invokeTime;
			var handleResultTimes = responseTime - completeTime;
			var totalTimes = responseTime -requestTime;
			var interfaceName = IF.type + "/" + IF.path;
			var userId = arg.Input.usrId;
			var runtimeArg = {
				"userId":userId,
				"interfaceName":interfaceName,
				"requestTime":requestTime,
				"invokeTime":invokeTime,
				"completeTime":completeTime,
				"responseTime":responseTime,
				"handleRequestTimes":handleRequestTimes,
				"invokeInterfaceTimes":invokeInterfaceTimes,
				"handleResultTimes":handleResultTimes,
				"totalTimes":totalTimes
			};
			cttqUtil.analyInterfaceRunTimes(runtimeArg,function(err,data){});
        } else {
            Response.end(JSON.stringify({
                status : '-1',
                message : 'Error'
            }));
        }
    });
}

exports.Runner = run;
