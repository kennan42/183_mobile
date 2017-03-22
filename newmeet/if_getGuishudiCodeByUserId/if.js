var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");
var async = require("async");
var path = require("path");

function run(Param, Robot, Request, Response, IF) {
    try {
        //var arg = JSON.parse(Param.body.toString());
       // var userId = arg.userId;
        var hrCode = null;
        Response.setHeader("Content-type","text/json;charset=utf-8");
        async.series([
        //查询用户的人事信息
        function(callback) {
           var param = {
                "IT_EXTENDMAP" : {
                    "item" : [{
                        "FIELDNAME" : "",
                        "VALUE" : ""
                    }]
                },
                "I_PUBLIC" : {
                    "CHANNELSERIALNO" : "",
                    "ORIGINATETELLERID" : "",
                    "ZDOMAIN" : 100,
                    "I_PAGENO" : "",
                    "I_PAGESIZE" : "",
                    "ZVERSION" : ""
                },
                "P_PNAME" : 8102406,

            };
            var option = {
                wsdl : path.join(__dirname.replace(IF.name,""), global.wsdl, "ZHR_READ_EE_INFO.xml"),
                func : "ZHR_READ_EE_INFO.ZHR_READ_EE_INFO.ZHR_READ_EE_INFO_FROM_TAB",
                Params : param,
                agent:false
               // BasicAuth : global.TXSOAPAuth
            };

            MEAP.SOAP.Runner(option, function(err, res, data) {
                if (!err) {
                    hrCode = parseInt(data.EASY_TAB.item[0].BUKRS);
                    callback(err,"");
                } else {
                    Response.end(JSON.stringify({
                        status : '-1',
                        msg : '查询用户人事信息失败'
                    }));
                    return;
                }
            });
        },
        //查询用户厂区的归属地的code
        function(callback) {
            var db=mongoose.createConnection(global.mongodbURL);
            var MeetGuishudiModel=db.model("meetguishudi",sm.MeetGuishudiSchema);
            MeetGuishudiModel.findOne({hrCompanycode:hrCode},function(err,doc){
                db.close();
                if(!err && doc != null){
                    Response.end(JSON.stringify({
                        status:"0",
                        msg:"查询成功",
                        guishudi:doc
                    }));
                }else{
                    Response.end(JSON.stringify({
                        status:"-1",
                        msg:"查询失败"
                    }));
                }
                return;
            });
        }], function() {

        });
    } catch(e) {

    }

}

exports.Runner = run;

