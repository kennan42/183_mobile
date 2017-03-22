var MEAP = require("meap");
var path = require("path");

/**
 *会议室预定用户登陆
 * @author donghua.wang
 * @version 2015年2月7日09:43
 *  */
function run(Param, Robot, Request, Response, IF){
    var option={
        wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"AdWebService.xml"),
        func:"AdWebService.AdWebServiceSoap.CheckUser2",
        Params:'<cttq:CheckUser2>'
            +'<cttq:loginName>' + Param.fields.userId + '</cttq:loginName>'
            +'<cttq:password>' + Param.fields.password + '</cttq:password>'
            +'<cttq:invokeUser>cttq</cttq:invokeUser>'
            +'<cttq:invokePassword>cttq123.com</cttq:invokePassword>'
            +'<cttq:invokeApp></cttq:invokeApp>'
        +'</cttq:CheckUser2>',
        BasicAuth:global.TXSOAPAuth 
    };
    
    
    MEAP.SOAP.Runner(option,function(err,res,data){
        Response.setHeader("Content-type","text/json;charset=utf-8");
        if(!err)
        {
            if (data.CheckUser2Result == '调用成功') {
                var uuid = Robot.createSession(Response, true, 300 * 60);
                Robot.Set("userId",  Param.fields.userId);
                var cookies = Response.getHeader("Set-Cookie") || [];
                cookies.push("x-mas-app-info=" + Param.appid + "/" + uuid + "; path=/");
                cookies.push("userid=" + Param.fields.userId + ";path=/");
                Response.setHeader("Set-Cookie", cookies);
                Response.setHeader("Location", "/roomMeeting/" + forwardUrl);
                Response.statusCode = 302;
                Response.end();
            }
            else
            {
                Robot.destorySession(Request, Response);
                Response.setHeader("Location", "/roomMeeting/login.html#error=Login Fail");
                Response.statusCode = 302;
                Response.end();
            }    
        }
        else
        {
            Response.setHeader("Location", "/roomMeeting/login.html#error=Login Fail");
            Response.statusCode = 302;
            Response.end();
        }
    });
    
}

exports.Runner = run;




