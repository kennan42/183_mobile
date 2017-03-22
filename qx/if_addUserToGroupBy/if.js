var MEAP = require("meap");
var tokenUtil = require("tokenUtil");

/**
 * 环信服务器群组添加用户
 * 作者：xialin
 * 时间：20160412
 */
 
var arg = null;
function run(Param, Robot, Request, Response, IF) {

    arg = JSON.parse(Param.body.toString());

    tokenUtil.getToken(function(err, data) {
       
        addUser(data,Response);
    });

}


function addUser(token,Response){
    var url = "https://a1.easemob.com/" + global.easemob.orgName + "/" + global.easemob.appName + "/chatgroups/"+arg.chatgroupid+"/users";
    var data={
      
      "usernames":arg.members
        
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
    
    MEAP.AJAX.Runner(option, function(err, res, data) {
        
          Response.setHeader("Content-Type", "application/json;charset=utf8");
        if (!err) {
            
            var data = JSON.parse(data);
           
             Response.end(JSON.stringify({
                    "status" : 0,
                    "msg" : "添加成功",
                    "data":data
                }));
        } else {
             Response.end(JSON.stringify({
                    "status" : -1,
                    "msg" : "添加失败"
                    
                }));
        }
    });
    
    
}


exports.Runner = run;


                                

	

