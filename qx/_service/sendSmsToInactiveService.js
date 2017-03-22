var MEAP=require("meap");
var mongoose = require("mongoose");
var async = require("async");
var baseSchema = require("../../base/BaseSchema.js");
var baseConfigDao = require("../_dao/baseConfigDao.js");
var sendSmsToInactiveusersLogDao = require("../_dao/sendSmsToInactiveusersLogDao.js");

var sendSmsToInactiveService = {
    getSingleChatFlag : function(cb){
        baseConfigDao.getConfigByName("singleChatFlag",function(err,data){
            if(!err){
                cb(null,data["value"]);
            }else{
                cb(err,data);
            }
        })
    },
    
    getGroupChatFlag : function(cb){
        baseConfigDao.getConfigByName("groupChatFlag",function(err,data){
            if(!err){
                cb(null,data["value"]);
            }else{
                cb(err,data);
            }
        });        
    },
    
    saveLog: function(log, cb){
        sendSmsToInactiveusersLogDao.saveLog(log,cb);
    }
};

exports.getGroupChatFlag = sendSmsToInactiveService.getGroupChatFlag;
exports.getSingleChatFlag = sendSmsToInactiveService.getSingleChatFlag;
exports.saveLog = sendSmsToInactiveService.saveLog;
