var MEAP = require("meap");
var json2xls = require('json2xls');
var fs = require('fs');
function run(Param, Robot, Request, Response, IF) {

    var arg = JSON.parse(Param.body.toString());
    var titleType = arg.titleType;
    var quesCode = arg.quesCode;
    var publishType = arg.publishType;
    var quesContent = arg.quesContent;
    var quesRaiserWorkCode = arg.quesRaiserWorkCode;
    var quesRaiserName = arg.quesRaiserName;
    var quesRaiserBeginTime = arg.quesRaiserBeginTime;
    var quesRaiserEndTime = arg.quesRaiserEndTime;
    var quesAccepterWorkCode = arg.quesAccepterWorkCode;
    var quesAccepterName = arg.quesAccepterName;
    var quesAcceptBeginTime = arg.quesAcceptBeginTime;
    var quesAcceptEndTime = arg.quesAcceptEndTime;

    var pageNum = arg.pageNum;
    var pageSize = arg.pageSize;

    var data = {
        "titleType" : 6,
        "quesCode" : "",
        "quesContent" : "",
        "quesRaiserWorkCode" : "",
        "quesRaiserName" : "",
        "quesRaiserBeginTime" : null,
        "quesRaiserEndTime" : null,
        "quesAccepterWorkCode" : "",
        "quesAccepterName" : "",
        "quesAcceptBeginTime" : null,
        "quesAcceptEndTime" : null,
        "sysTypeCid" : "",
        "belongSysTypeCid" : "",
        "turnApproveBusi" : "",
        "turnSubMaster" : "",
        "pageNum" : 1,
        "pageSize" : 20000,
        "quesTypeCid" : "",
        "quesOriginCid" : "",
        "publishType" : 3
    };

    // Response.setHeader("Content-type", "text/json;charset=utf-8");
    var option = {
        method : "POST",
        url : global.its + "/its-gwy/mainques/workBillMainList.json",
        Cookie : "true",
        agent : "false",
        Enctype : "application/json",
        Body : data
    };

    MEAP.AJAX.Runner(option, function(err, res, data) {
        
        
       console.log(data);
        if (!err) {
          
           var data =JSON.parse(data);
           if(data.resultJson!=null&&data.resultJson.list.length!=0){
               
                var xls = json2xls(data.resultJson.list);
                fs.writeFileSync('/opt/emm/uploads/its/test.xlsx', xls, 'binary');
                Response.end(JSON.stringify({
                status : '1',
                message : "success"
                }));
           }
           
            
            
        } else {
            Response.end(JSON.stringify({
                status : '-1',
                message : JSON.stringify(err)
            }));
        }
    }, Robot);

    // var json = {
        // foo : 'bar',
        // qux : 'moo',
        // poo : 123,
        // stux : new Date()
    // }
    // var xls = json2xls(json);
    // //console.log(xls);
    // fs.writeFileSync('/usr/share/nginx/storage/test.xlsx', xls, 'binary');
    // Response.end(JSON.stringify({
        // status : 0,
        // message : "Success"
    // }));

    /*
     var noneExistFileName = ['async_create.', new Date()-0, '.txt'].join('');
     fs.writeFile(noneExistFileName, '鏂囦欢涓嶅瓨鍦紝鍒欏垱寤�, function(err){
     if(err) throw err;
     console.log(noneExistFileName+'涓嶅瓨鍦紝琚垱寤轰簡锛�);
     });*/

    console.log(111111);
}

exports.Runner = run; 