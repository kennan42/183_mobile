var MEAP=require("meap");

/**
 * 添加人员信息
 * author:zrx
 * time:2016.12.23
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param, Robot, Request, Response, IF)
{
    Response.setHeader("Content-type", "text/json;charset=utf-8");
    var option = {
        method : "POST",
        url : global.iknow + "/iknow-gwy/userBusi/addUserInfo",
        Cookie : "true",
        agent : "false",
        Enctype : "application/json",
        Body : Param.body.toString()
    };

    MEAP.AJAX.Runner(option, function(err, res, data) {
        if (!err) {
            Response.end(data);
        } else {
            Response.end(JSON.stringify({
                status : '1',
                message : JSON.stringify(err)
            }));
        }
    }, Robot);
}

exports.Runner = run;


                                

	

