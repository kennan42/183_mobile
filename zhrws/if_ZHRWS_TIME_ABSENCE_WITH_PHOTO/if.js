var MEAP = require("meap");
var path = require("path");
var cp = require("child_process");
var fs = require('fs');
var timeErrors = null;
var personPhots = null;
var dstIP = "";
var nginxIP = "";
var pageNumber = null;
var pageSize = null;
function run(Param, Robot, Request, Response, IF){
    var arg = JSON.parse(Param.body.toString());
    pageNumber = arg.IS_PUBLIC.I_PAGENO;
    pageSize = arg.IS_PUBLIC.I_PAGESIZE;
    arg.IS_PUBLIC.I_PAGENO = "";
    arg.IS_PUBLIC.I_PAGESIZE = "";
    var startDate = arg.startDate;
    var endDate = arg.endDate;
    
    if (global.wsdl == "wsdl_dev") {
        dstIP = "10.10.1.182";
        nginxIP = "10.10.1.182"
    }
    else 
        if (global.wsdl == "wsdl_test" || global.wsdl == "wsdl_qas900") {
            dstIP = "10.10.1.151";
            nginxIP = "aiqas.cttq.com"
        }
        else {
            dstIP = "10.10.1.149";
            nginxIP = "ai.cttq.com"
        }
    
    var option0 = {
        wsdl: path.join(__dirname.replace(IF.name, ""), global.wsdl, "ZHRWS_INQUIRY_SUBORDINATE.xml"),
        func: "ZHRWS2110.ZHRWS2110_soap12.ZHRWS2110",
        Params: arg,
        BasicAuth: global.TXSOAPAuth,
        agent:false
    };
    MEAP.SOAP.Runner(option0, function(err, res, data){
        if (!err) {
            var persons = data.INQUIRY.item;
            var personArray = transformPersons(persons);
            timeErrors = [];
            personPhots = [];
            getPersonTimeError(Response, IF, personArray, timeErrors, startDate, endDate);
        }
        else {
            Response.end(JSON.stringify({
                status: '-1',
                message: 'Error'
            }));
        }
    });
}

function transformPersons(persons){
    var personArray = [];
    for (var i = 0; i < persons.length; i++) {
        personArray.push({
            "PERNR": persons[i].PERNR
        });
    }
    return personArray;
}

function getPersonTimeError(Response, IF, personArray, timeErrors, startDate, endDate){
    var reqJSON = {
		"APPROVAL":"",
        "BEGDA": startDate,
        "ENDDA": endDate,
		"BUSINESS_TYPE":"2001",
		"IS_PUBLIC": {
            "FLOWNO": "",
            "PERNR": "",
            "ZDOMAIN": "100",
            "I_PAGENO": pageNumber,
            "I_PAGESIZE": pageSize
        },
        "T_PERNR": {
            "item": personArray
        }
    };
    
    var option1 = {
        wsdl: path.join(__dirname.replace(IF.name, ""), global.wsdl, "GET_DEPT_LINES.xml"),
        func: "ZHRWS2115.ZHRWS2115_soap12.ZHRWS2115",
        Params: reqJSON,
        BasicAuth: global.TXSOAPAuth,
        agent:false
    };
    MEAP.SOAP.Runner(option1, function(err, res, data){
        if (!err) {
            if (data.T_COUNT.item != null) {
                var timeErrorArray = data.T_COUNT.item;
                for (var i = 0; i < timeErrorArray.length; i++) {
                    timeErrors.push({
                        count: timeErrorArray[i].LINES,
                        personId: timeErrorArray[i].PERNR,
                        personName: timeErrorArray[i].NACHN
                    });
                }
                Response.end(JSON.stringify({
                    status: '0',
                    timeErrors: timeErrors
                }));
            }
            else {
                Response.end(JSON.stringify({
                    status: '0',
                    timeErrors: []
                }));
            }
        }
        else {
            Response.end(JSON.stringify({
                status: '-1',
                message: 'Error'
            }));
        }
    });
}

exports.Runner = run;
