var MEAP = require("meap");
var path = require("path");
var cp = require("child_process");
var fs = require('fs');
var REDIS = require("meap_redis");
var persons = null;
var dstIP = "";
var nginxIP = "";
var personPhots = null;
var notCached = null;

function run(Param, Robot, Request, Response, IF){
    var arg = JSON.parse(Param.body.toString());
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
    
    var option = {
        wsdl: path.join(__dirname.replace(IF.name, ""), global.wsdl, "PORTAL_BPMI_CompleteTaskSum.xml"),
        func: "PORTAL_BPMI_CompleteTaskList.PORTAL_BPMI_CompleteTaskList_Port.PORTALBPMICompleteTaskList",
        Params: arg,
        agent:false
    };
    
    MEAP.SOAP.Runner(option, function(err, res, data){
        if (!err) {
            personPhots = [];
            notCached = [];
            var type = data.output.type;
            if (type == "S") {
				if(data.output.totalCount == 1){
					var tmpObj = data.output.cpTaskList;
					persons.push(eval(tmpObj));
				}else{
					persons = data.output.cpTaskList;
				}
                hget(Response, IF, persons, personPhots, data);
            }
            else {
                Response.setHeader("Content-type", "text/json;charset=utf-8");
                Response.end(JSON.stringify({
                    status: "0",
                    data: data
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

function hget(Response, IF, persons, personPhots, data){
    try {
        var Client = REDIS.createClient(global.redisPort, global.redisHost);
        Client.on("ready", function(){
            Client.select(1, handlePersonPhoto(Client, Response, IF, persons, 0, personPhots, data));
        });
    } 
    catch (e) {
        return "error";
    }
}


function hset(_hash, arr){
    try {
        var Client = REDIS.createClient(global.redisPort, global.redisHost);
        Client.on("ready", function(){
            Client.select(1, setPersonImage(Client,0,arr));
            
        });
    } 
    catch (e) {
    }
}

function setPersonImage(Client, i, arr){
    i = 0 || i;
    if (i < arr.length) {
        Client.HSET("cttqImage", arr[i].personId, arr[i].filename, function(err, obj){
            if (!err && obj) {
                i+=1;
				setPersonImage(Client, i, arr);
            }
            else {
               i+=1;
			   setPersonImage(Client, i, arr);
            }
        });
		
    }else{
		Client.quit();
	}
}

function handlePersonPhoto(Client, Response, IF, persons, i, personPhots, data1){
    i = 0 || i;
    if (i < persons.length) {
        Client.HGET("cttqImage", persons[i].reqUsrId, function(err, obj){
            if (!err && obj) {
                personPhots.push({
                    personId: persons[i].reqUsrId,
                    hasPhoto: "0",
                    imageURL: "http://" + nginxIP + ":8888/doc/" + obj
                });
                i += 1;
                handlePersonPhoto(Client, Response, IF, persons, i, personPhots, data1);
            }
            else {
                var paramJSon = {
                    "IT_EXTENDMAP": {
                        "item": [{
                            "FIELDNAME": '',
                            "VALUE": ''
                        }]
                    },
                    "I_PUBLIC": {
                        "CHANNELSERIALNO": '',
                        "ORIGINATETELLERID": '',
                        "ZDOMAIN": '100',
                        "I_PAGENO": '',
                        "I_PAGESIZE": '',
                        "ZVERSION": ''
                    },
                    "P_PERNR": persons[i].reqUsrId
                };
                var option1 = {
                    wsdl: path.join(__dirname.replace(IF.name, ""), global.wsdl, "ZHRMMS_READ_PHOTO.xml"),
                    func: "ZHRWSMSS05.ZHRWSMSS05_soap12.ZHRWSMSS05",
                    Params: paramJSon,
                    agent:false
                };
                MEAP.SOAP.Runner(option1, function(err, res, data){
                    if (!err) {
                        if (data.E_PUBLIC.CODE == '0') {
                            var filename = option1.Params.P_PERNR + ".jpg";
                            var filepath = "/tmp/" + filename;
                            var d = new Buffer(data.B64DATA, "base64");
                            fs.writeFileSync(filepath, d);
                            var cmd = "scp " + filepath + " root@" + dstIP + ":" + "/usr/share/nginx/html/doc";
                            cp.exec(cmd, function(err, stdout, stderr){
                                if (!err) {
                                    var url = "http://" + nginxIP + ":8888/doc/" + filename;
                                    personPhots.push({
                                        "personId": option1.Params.P_PERNR,
                                        "imageURL": url,
                                        "hasPhoto": "0"
                                    });
                                    notCached.push({
                                        personId: option1.Params.P_PERNR,
                                        filename: filename
                                    });
                                }
                                i += 1;
                                handlePersonPhoto(Client, Response, IF, persons, i, personPhots, data1);
                            })
                        }
                        else {
                            personPhots.push({
                                "personId": option1.Params.P_PERNR,
                                "hasPhoto": "1"
                            });
                            i += 1;
                            handlePersonPhoto(Client, Response, IF, persons, i, personPhots, data1);
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
        });
    }
    else {
        Client.quit();
        if (notCached.length > 0) {
            hset("cttqImage", notCached);
        }
        Response.end(JSON.stringify({
            status: "0",
            personPhots: personPhots,
            data: data1
        }));
    }
}

exports.Runner = run;
