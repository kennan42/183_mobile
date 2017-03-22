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
        var staffNum = {};
        if (Param.body != null) {
            var byteDate = Param.body.toString('UTF-8');
            staffNum = JSON.parse(byteDate);
        }
        else 
            if (Param.fields != null) {
                staffNum = Param.fields;
            }
            else {
                Response.end(base.makeRetStr('warn', 'json数据错误！'));
                return;
            }
        if (base.isIncludeKey(staffNum, "employeeNum") && base.getJsonLength(staffNum) == 1) {
            DyCodeService.getMobileDyCode(staffNum, function(error, result){
                if (error) {
                    Response.end(base.makeRetStr('error', error.toString()));
                    return;
                }
                else {
                    Response.end(base.makeRetStr('success', {
                        "dycode": result
                    }));
                    return;
                }
            });
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
