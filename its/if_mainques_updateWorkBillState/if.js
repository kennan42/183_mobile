/*------------------------------------------------------------
 // Copyright (C) 2015 正益无线（北京）科技有限公司  版权所有。
 // 文件名：if.js
 // 文件功能描述： 修改工单状态接口    zabbix工单验证
 //
 // 创 建 人：xialin
 // 创建日期：2016.7.10
 //
 // 修 改 人：
 // 修改日期：
 // 修改描述：
 //-----------------------------------------------------------*/

var MEAP = require("meap");

var async = require("async");

function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-type", "text/json;charset=utf-8");

    async.waterfall([

    //获取工单详情
    function(cb) {
        var arg = JSON.parse(Param.body);
        if (arg.busiType == '1') {

            console.log(11111111111);
            //确认已解决
            var option = {
                method : "POST",
                url : global.its + "/its-gwy/mainques/queryQuesDetail.json",
                Cookie : "true",
                agent : "false",
                Enctype : "application/json",
                Body : Param.body.toString()
            };

            MEAP.AJAX.Runner(option, function(err, res, data) {
                if (!err) {
                    console.log(data);

                    cb(null, data);
                } else {
                    cb(-1, "查询工单详情出错");
                }
            }, Robot);

        } else {
            console.log(2222222222);
            cb(null, '1');
        }

    },
    function(data, cb) {
        console.log(333333333333333);
        console.log("data:"+data+"1111111111");
        //确认是否zabbix
        var data = JSON.parse(data);
        
    
        if (null!=data.resultJson&&null!=data.resultJson.zabbixStatus && data.resultJson.zabbixStatus == '1'&&null!=data.resultJson.alarmCode) {
            
            var  eventids =data.resultJson.alarmCode;
            //确认是否zabbix
            //根据工单查询是否是zabbix自动生成
            var option = {
                method : "POST",
                url : global.zabbix.url,
                Cookie : "true",
                agent : "false",
                Enctype : "application/json",
                Body : {
                    "jsonrpc" : "2.0",
                    "method" : "user.login",
                    "params" : {
                        "user" : global.zabbix.user,
                        "password" : global.zabbix.password
                    },
                    "id" : 1
                }
            };

            MEAP.AJAX.Runner(option, function(err, res, data) {

                if (!err) {

                    var auth = JSON.parse(data).result;

                    var option = {
                        method : "POST",
                        url : global.zabbix.url,
                        Cookie : "true",
                        agent : "false",
                        Enctype : "application/json",
                        Body : {
                            "jsonrpc" : "2.0",
                            "method" : "trigger.get",
                            "params" : {
                                "output" : "extend",
                                "triggerids" : eventids,
                               // "triggerids": "17698177",
                                "selectLastEvent": 1  
                            },
                            "auth" : auth,
                            "id" : 1

                        }
                    }
                     console.log("---------------------sssssssssssssssss------------------");
                     console.log(JSON.stringify({
                status : 'aaa',
                option : option
            }));
                    MEAP.AJAX.Runner(option, function(err, res, data) {
                        if (!err) {

                            var data = JSON.parse(data);
                            console.log("---------------------------------------"); 
                           
            
                            if (null!=data.result &&  null!=data.result[0]&& null!=data.result[0].value&&null!=data.result[0].lastEvent.acknowledged) {
                                //value=1 故障       acknowledged=1 未确认   
                                if(data.result[0].value=='1'&&data.result[0].lastEvent.acknowledged=='0'){
                                    //故障中
                                     cb(null, '1');
                                }else{
                                    cb(null, '0');
                                }
                               

                            } else {
                                cb(null, '0');
                                //cb(-1, "查询zabbix详情出错");
                            }

                        } else {

                            cb(-1, "查询zabbix详情出错");
                        }
                    }, Robot);

                } else {
                    cb(-1, "请求zabbix登录失败");
                }

            }, Robot);

        } else {
            
            console.log(44444444444);
            //不是zabbix
            cb(null, '0');
        }

    },
    function(data2, cb) {
        //根据得出的结果 设置工单关闭
        if (data2 == '1') {
            //故障中
            cb(-1, "监测系统处于故障中");
        } else {
            //解决了
            var option = {
                method : "POST",
                url : global.its + "/its-gwy/mainques/updateWorkBillState.json",
                Cookie : "true",
                agent : "false",
                Enctype : "application/json",
                Body : Param.body.toString()
            };

            MEAP.AJAX.Runner(option, function(err, res, data) {
                if (!err) {
                    cb(null, data);
                } else {
                    cb(-1, err);
                }
            }, Robot);

        }

    }], function(err, data) {

        if (!err) {

            Response.end(data);

        } else {
            console.log(4444);
            //出错了
            Response.end(JSON.stringify({
                status : '1',
                message : data
            }));
        }

    });

}

exports.Runner = run;


