var mongoose = require("mongoose");
var Schema = require("../_model/Schema.js");

var config = {
    saveLog: function(log, cb){
        var conn = mongoose.createConnection(global.mongodbURL);
        var SendSmsToInactiveUsersLogModel = conn.model("send_sms_to_inactiveusers_log",Schema.SendSmsToInactiveUsersLogsSchema);
        var sendSmsToInactiveUsersLog = new SendSmsToInactiveUsersLogModel({
            requestDate:log.requestDate,
            requestTime:log.requestTime,
            arg:log.arg,
            invokeEasemobTime:log.invokeEasemobTime,
            completeEasemobTime:log.completeEasemobTime,
            sendSmsTime:log.sendSmsTime,
            sendSmsOption:log.sendSmsOption,
            completeSendSmsTime:log.completeSendSmsTime,
            sendSmsResult:log.sendSmsResult,
            requestCostTime:log.requestCostTime,
            invokeEasemobCostTime:log.invokeEasemobCostTime,
            handleDataCostTime:log.handleDataCostTime,
            sendSmsCostTime:log.sendSmsCostTime
        });
        sendSmsToInactiveUsersLog.save(function(err,rs){
                conn.close();
                if(!err){
                    console.log("save log success.");
                    cb(null,"save log success");
                }
                else{
                    console.log("save log unsuccess:" + err);
                    cb(err,"save log unsuccess");
                }
                
        });        
    }
    
};
exports.saveLog = config.saveLog;
