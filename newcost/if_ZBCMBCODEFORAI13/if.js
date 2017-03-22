var MEAP=require("meap");
var path = require("path");
/**
 * 费用报销2期人员基本信息
 * 点击费用报销时，获取人事相关的基本不会变化的信息，
 * 此接口为原个人信息接口(ZBCMFORIOS12)、
 * 获取功能范围接口(ZHRWS_READ_FKBER)、
 * 获取员工家庭地址接口(ZHR_GET_FMAILY_ADDRESS)，3个接口的整合
 * zrx,2016.7.25
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param,Robot,Request,Response,IF)
{
    var arg = JSON.parse(Param.body.toString());
	var option={
        wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"zbcmbcodewsforai13.xml"),
        func:"ZBCMBCODEWSFORAI13.ZBCMBCODEWSFORAI13.ZBCMBCODEFORAI13",
        Params:arg,
        agent:false
	};
	
	MEAP.SOAP.Runner(option,function(err,res,data){
	    Response.setHeader("Content-type","text/json;charset=utf-8");
        if(!err)
		{
			Response.end(JSON.stringify(data));
		}
		else
		{
			Response.end(JSON.stringify({status:'-1',message:'Error'}));
		}
	});
}

exports.Runner = run;
