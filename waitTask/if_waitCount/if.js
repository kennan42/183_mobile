var MEAP = require("meap");
var async = require("async");
var _ = require("underscore");
/**
 * 统一代办3.0 HANA
 * 待办数量：取不同待办类型的记录条数全部时间内条数
 * HANA语句：http://10.10.1.104:8000/cttqdc/services/wflow/wait_task.xsodata/waitlist?$expand=Expand_task&$filter=substringof('8101439',UID_FILTER)&$select=BUSSCATG,BUSSCATGNM,COUNT&$format=json
 *
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
function run(Param, Robot, Request, Response, IF) {
    arg = JSON.parse(Param.body.toString());
    console.log(hpGetCSN(null));

    main(Response);

}

function main(Response) {

    async.parallel([getHanaCount, getMeetCount], function(err, data) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err) {
            console.log(data[0]);
            console.log(data[1]);
          
            //删除
            // delete data[0].F010;
            totalCount = hanaCount + data[1] ;
          
            data[0]['meet'] = data[1];

            Response.end(JSON.stringify({
                "status" : "0",
                "totalCount" : totalCount,
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
    // var url = global.baseHANA + "/cttqdc/services/wflow/wait_task.xsodata/waitlist?$expand=Expand_task&$filter=substringof('" + arg.userId + "',UID_FILTER)&$select=BUSSCATG,BUSSCATGNM,COUNT&$format=json";

    var url = global.baseHANA + "/cttqdc/services/wflow/wait_task.xsjs?UID=" + arg.userId;

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

            var data = JSON.parse(data);
           // console.log(data.length);

            var BUSSCATG = _.pluck(data, 'BUSSCATG');
            var COUNT = _.pluck(data, 'COUNT');

           // console.log('BUSSCATG', BUSSCATG);
            //console.log('COUNT', COUNT);
            var result = _.object(BUSSCATG, COUNT);
           // console.log('result', result);

            if (data.length != 0) {
                hanaCount = _.reduce(COUNT, function(a, b) {
                    return parseInt(a) + parseInt(b)
                });

            } else {
                hanaCount = 0;

            }

            callback(null, result);
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

                callback(null, data.AllCount);
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
//             "beginDate" : "",
//             "endDate" : ""
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
//   console.log(count);
//                     callback(null, count);
//                 } else {
//                     console.log(data.output.taskList.taskNum);
//                     callback(null, parseInt(data.output.taskList.taskNum));
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
