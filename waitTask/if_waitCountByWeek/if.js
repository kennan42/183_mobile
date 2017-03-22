var MEAP = require("meap");
var async = require("async");
var _ = require("underscore");
var moment = require('moment');
/**
 * 统一代办3.0 HANA
 * 待办数量：取不同待办类型的记录条数  一周时间内条数
 * HANA语句:http://10.10.1.104:8000/cttqdc/services/wflow/wait_task.xsodata/waitlist?$expand=Expand_task&$filter=substringof('8101439',UID_FILTER) and STARTTIME ge '20160324' and STARTTIME le '20160427'&$select=BUSSCATG,BUSSCATGNM,COUNT&$format=json
 * 1.先查询各个待办总数，
 * 2.再查询会议室数量，
 * 3.在查IT服务数量
 * 作者：xialin
 * 时间:2016-8-22
 *
 */
var arg = null;
var totalCount = 0;
//总数
var hanacount = 0;
//hana总数
var currentDate = null;
var weekDate = null;
function run(Param, Robot, Request, Response, IF) {
    arg = JSON.parse(Param.body.toString());
   
    //当前时间
    currentDate = moment(new Date()).format("YYYYMMDD");
    //减去七天时间
    weekDate = moment(new Date()).subtract(7, 'days').format("YYYYMMDD");
   
    main(Response);

}

function main(Response) {

    async.parallel([getHanaCount, getMeetCount], function(err, data) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err) {
            console.log(data[0]);
            console.log(data[1]);
          
  
          
            data[0]['meet'] = data[1];
            Response.end(JSON.stringify({
                "status" : "0",
                "data" : data[0]
            }));

        } else {

            Response.end(JSON.stringify({
                "status" : "-1",
                "msg" : data
            }));

        }

    });
}

//获取hana的代办数量
function getHanaCount(callback) {
    //http://10.10.1.104:8000/cttqdc/services/wflow/wait_task.xsjs?UID=8101439&BEGDAT=20160324&ENDDAT=20160501
  
    var url =global.baseHANA +"/cttqdc/services/wflow/wait_task.xsjs?UID="+arg.userId+"&BEGDAT=20000101&ENDDAT="+weekDate
    var option = {
        agent : false,
        method : "GET",
        url : url,
        BasicAuth : global.HanaAuth

    };
    console.log(url);

    MEAP.AJAX.Runner(option, function(err, res, data) {
        //Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err) {
            console.log(data); 
            var data = JSON.parse(data);
           if (data instanceof Array) {

                var BUSSCATG = _.pluck(data, 'BUSSCATG');
                var COUNT = _.pluck(data, 'COUNT');
               
                var result = _.object(BUSSCATG, COUNT);
               
                callback(null, result);
            } else {
                callback(-1, "查询HANA出错");
            }

        } else {
            callback(-1, "查询HANA出错");
        }
    });

}

//获取会议室的代办数量
function getMeetCount(callback) {

    var option = {
        method : 'POST',
        url : global.baseURL + "/meet/getChargeCount",
        Body : {
            "userId" : arg.userId,
            "state" : "0"
        },
        Cookie : "false"

    };

    MEAP.AJAX.Runner(option, function(err, res, data) {

        if (!err) {
            var data = JSON.parse(data);
            if (data.status == 0) {

                callback(null, data.ServenAgoCount);
            } else {
                callback(-1, "查询会议室出错");
            }

        } else {
            callback(-1, "查询会议室出错");
        }
    });
}

//获取IT服务的代办数量
// function getItCount(callback) {

//     var params = {
//         "input" : {
//             "channelSerialNo" : hpGetCSN(null),
//             "currUsrId" : arg.userId,
//             "domain" : "400",
//             "extendMap" : {
//                 "entry" : {
//                     "Key" : "",
//                     "Value" : ""
//                 }
//             },
//             "bussType" : "ITS",
//             "beginDate" : weekDate,
//             "endDate" : currentDate
//         }
//     };

//     var option = {
//         method : 'POST',
//         url : global.baseURL + '/docPlatform/PORTALBPMIAIWaitTaskSumImplBean',
//         Body : params,
//         Cookie : "false"
//     };

//     MEAP.AJAX.Runner(option, function(err, res, data) {

//         var data = JSON.parse(data);
//         if (data.output) {

//             if (data.output.taskList) {
//                 if (data.output.taskList instanceof Array) {
//                     //计算数目
//                     var countArr = _.pluck(data.output.taskList, 'taskNum');
//                     var count = _.reduce(countArr, function(a, b) {
//                         return parseInt(a) + parseInt(b)
//                     });

//                     callback(null, count);
//                 }else{
//            callback(null,parseInt(data.output.taskList.taskNum));
//                 }

//             } else {

//                 //结果为0
//                 callback(null, 0);
//             }

//         } else {
//             //结果出错
//             callback(-1, "查询IT服务出错");
//         }

//     });

// }

function hpGetCSN(a) {
    return a || '0' + ':' + (arg.userId || '0000000') + ':' + new Date().getTime();
}

exports.Runner = run;
