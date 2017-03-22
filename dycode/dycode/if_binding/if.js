/*!
 * @function : 设备绑定
 * @date : 2014-09-17上午11:43:12
 * @author : liulinkun
 * @version : 1.0
 */
var DyCodeService = require('dyserver').DycodeService;
function run(Param, Robot, Request, Response, IF){
    try {
        var dyCodeJson = {};
        var byteDate = "";
        if (Param.body != null) {
            byteDate = Param.body.toString('UTF-8');
            dyCodeJson = JSON.parse(byteDate);
        }
        else 
            if (Param.fields != null) {
                //userJson["username"] = Param.fields.username;
                //userJson["password"] = Param.fields.password;
                //userJson = JSON.parse(Param.fields);
                dyCodeJson = Param.fields;
            }
            else {
                Response.end(JSON.stringify({
                    code: 401,
                    msg: 'json数据错误，请检查！'
                }));
            }
        DyCodeService.bindingMobile(dyCodeJson, function(mark, msg){
            Response.end(JSON.stringify({
                msg: msg
            }));
        });
    } 
    catch (e) {
        console.log(e);
        Response.statusCode = 500;
        Response.end(JSON.stringify({
            msg: '接口异常！'
        }));
    }
}

exports.Runner = run;
