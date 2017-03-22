var MEAP = require("meap");

var tokenUtil = require("tokenUtil");

/**
 * 环信服务器创建群组
 * 作者：xialin
 * 时间：20160412
 */

var arg = null;
function run(Param, Robot, Request, Response, IF) {

    arg = JSON.parse(Param.body.toString());

    tokenUtil.getToken(function(err, data) {

        createGroup(data, Response);
    });

}

function createGroup(token, Response) {

    var url = "https://a1.easemob.com/" + global.easemob.orgName + "/" + global.easemob.appName + "/chatgroups";

    var ifpublic = true;
    var ifapproval = false;
    if (arg.public == "false" || arg.public == false) {
        ifpublic = false;
    }

    if (arg.approval == "true" || arg.approval == true) {
        ifapproval = true;
    }

    var data = {
        "groupname" : arg.groupname, //群组名称, 此属性为必须的
        "desc" : arg.desc, //群组描述, 此属性为必须的
        "public" : ifpublic, //是否是公开群, 此属性为必须的
        "maxusers" : arg.maxusers, //群组成员最大数(包括群主), 值为数值类型,默认值200,此属性为可选的
        "approval" : ifapproval, //加入公开群是否需要批准, 默认值是false（加如公开群不需要群主批准）, 此属性为必选的，私有群必须为true
        "owner" : arg.owner, //群组的管理员, 此属性为必须的
        "members" : arg.members//群组成员,此属性为可选的,但是如果加了此项,数组元素至少一个（注：群主jma1不需要写入到members里面）
    };

    var option = {
        method : "POST",
        url : url,
        Cookie : "true",
        agent : "false",
        Headers : {
            "Authorization" : "Bearer " + token,
            "Content-Type" : "application/json"
        },
        Body : data
    };
      console.log("=====================qx  option==============",option);
    MEAP.AJAX.Runner(option, function(err, res, data) {

        Response.setHeader("Content-Type", "application/json;charset=utf8");
        if (!err) {

            var data = JSON.parse(data);

            if (data.error != null) {

             console.log("=================qx  data====================",data);
                if (data.error == 'illegal_argument') {

                    var errmsg = data.error_description;

                    var i = errmsg.indexOf('group member');
                    var e = errmsg.indexOf('doesn\'t exist');
                   console.log("====================qx====================",errmsg);
                    if (i != -1 && e != -1) {
                        var errUserId = errmsg.substring(13, e).trim();

                        Response.end(JSON.stringify({
                            "status" : -1,
                            "msgStatus" : "E4000512",
                            "msg" : "创建失败",
                            "errUserId" : errUserId

                        }));
                    }

                }

                Response.end(JSON.stringify({
                    "status" : -1,
                    "msgStatus" : "E4000511",
                    "msg" : "创建失败"

                }));
            } else {
                Response.end(JSON.stringify({
                    "status" : 0,
                    "msg" : "创建成功",
                    "msgStatus" : "S4000511",
                    "data" : data
                }));
            }

        } else {
            Response.end(JSON.stringify({
                "status" : -1,
                "msgStatus" : "E4000511",
                "msg" : "创建失败"

            }));
        }
    });

}

exports.Runner = run;

