/*!
 * @function : 获取动态码
 * @date : 2014-10-16上午11:43:12
 * @author : liulinkun
 * @version : 1.0
 */
var base = require('mobile-code').Base;
var DyCodeService = require('mobile-code').DycodeService;
function run(Param, Robot, Request, Response, IF){
    try {
       Response.setHeader("Content-type","text/json;charset=utf-8");
        var object = Param.params;
        if (object != null) {
            if (base.isIncludeKey(object, "employeeNum") && base.isIncludeKey(object, "dycode") && base.getJsonLength(object) == 2) {
                if (!base.verifyCode(object.dycode)) {
                    Response.end(base.makeRetStr('warn', '动态码不合法！'));
                    return;
                }
                DyCodeService.verify(object, function(error, result){
                    if (error) {
                        Response.end(base.makeRetStr('error', error.toString()));
                        return;
                    }
                    else {
                        if (result == null) {
                            Response.end(base.makeRetStr('warn', '该用户不存在，不可验证！'));
                            return;
                        }
                        else {
                            var dycode = object.dycode;
                            if (dycode == result.currentCode) {
                                Response.end(base.makeRetStr('success', {
                                    "verify": true
                                }));
                                return;
                            }
                            else {
                                Response.end(base.makeRetStr('success', {
                                    "verify": false
                                }));
                                return;
                            }
                        }
                    }
                });
                
            }
            else {
                Response.end(base.makeRetStr('warn', 'json数据错误！'));
                return;
            }
        }
        else {
            Response.end(base.makeRetStr('warn', 'json数据错误！'));
            return;
        }
        return;
    } 
    catch (e) {
        Response.end(base.makeRetStr('error', '接口异常！'));
        return;
    }
}

exports.Runner = run;
