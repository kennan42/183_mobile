var MEAP=require("meap");
var async = require("async");


/**
 * 获取IT服务信息，把人员的部门及工单的 详细 信息返回 
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param, Robot, Request, Response, IF)
{

    var option = {
        method : 'POST',
        url : global.baseURL + "/docPlatform/PORTALBPMIAIWaitTaskListImplBean",
        Body : Param,
        Cookie : "false"

    };

    MEAP.AJAX.Runner(option, function(err, res, data) {

        if (!err) {
            var data = JSON.parse(data);
            callback(null, data);
            
        } else {
            callback(-1, "查询失败");
        }
    });
}

exports.Runner = run;


                                

	

