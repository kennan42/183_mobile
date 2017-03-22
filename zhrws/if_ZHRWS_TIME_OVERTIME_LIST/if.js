var MEAP = require("meap");
var path = require("path");
var timeOvers = null;
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
    var option = {
        wsdl: path.join(__dirname.replace(IF.name, ""), global.wsdl, "ZHRWS_INQUIRY_SUBORDINATE.xml"),
        func: "ZHRWS2110.ZHRWS2110_soap12.ZHRWS2110",
        Params: arg,
        BasicAuth: global.TXSOAPAuth,
        agent:false
    };
    
    MEAP.SOAP.Runner(option, function(err, res, data){
        if (!err) {
            var persons = data.INQUIRY.item;
            var personArray = transformPersons(persons);
            timeOvers = [];
            getTimeOver(Response, IF, personArray, startDate, endDate);
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

function getTimeOver(Response, IF, personArray, startDate, endDate){
    var paramJSon = {
        "APPROVAL": '',
        "BEGDA": startDate,
        "ENDDA": endDate,
		"BUSINESS_TYPE":"2005",
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
    
    var option = {
        wsdl: path.join(__dirname.replace(IF.name, ""), global.wsdl, "GET_DEPT_LINES.xml"),
        func: "ZHRWS2115.ZHRWS2115_soap12.ZHRWS2115",
        Params: paramJSon,
        BasicAuth: global.TXSOAPAuth,
        agent:false
    };
    
    MEAP.SOAP.Runner(option, function(err, res, data){
        if (!err) {
            if (data.T_COUNT.item != null) {
                var arr = data.T_COUNT.item;
                for (var i = 0; i < arr.length; i++) {
                    timeOvers.push({
                        personId: arr[i].PERNR,
                        personName: arr[i].NACHN,
                        overtime: arr[i].LINES
                    });
                }
                
                Response.end(JSON.stringify({
                    status: "0",
                    timeOvers: timeOvers
                }));
            }
            else {
                Response.end(JSON.stringify({
                    status: "0",
                    timeOvers: []
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
