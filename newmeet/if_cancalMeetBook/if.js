var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");
var util = require("../../base/util.js");
var jpushUtil = require("../../jpush2/jpush_util.js");

/**
 * 取消会议室
 * zrx
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    Response.setHeader("Content-type", "text/json;charset=utf-8");
    var db = mongoose.createConnection(global.mongodbURL);
    var meetBookModel = db.model("meetBook", sm.MeetBookSchema); 
    meetBookModel.update({
        _id : arg.meetBookId
    }, {
        state : 4,
        canclereason:arg.canclereason
    }, function(err) { 
        if (!err) {
            Response.end(JSON.stringify({
                status : "0",
                msg : "取消成功"
            }));
            meetBookModel.findById(arg.meetBookId, function(err, doc) { 
                if (doc.needApply == 1) {
                    //需要推送 
                    pushMsg( doc, new Date().getTime()); 
                } 
            }); 
        } else {
            db.close();
            Response.end(JSON.stringify({
                status : "-1",
                msg : "取消失败"
            }));
        }
    });

}

exports.Runner = run;

function pushMsg( doc, times) {
    var userIds = [];
    var title = "亲," + util.getMMddHHmmFromTimes(doc.startTime) + "开始" + doc.name + "进行的会议已被用户取消啦~";
    
    
   
   var admin =doc.checkUser;
   
   for (var i=0; i < admin.length; i++) {
   
      
      userIds.push(admin[i].userId);
        var rtxArg = {
            "userId" : admin[i].userId,
            "title" : title,
            "times" : times
        };
        util.sendRTXMsg(rtxArg);
   }; 
    var jpushArg = {
        userid : meetRoomObj.userId,
        userList : userIds,
        title : "",
        content : title,
        type : 0,
        msgType : "MeetingRoomBooking",
        subModule : "MeetingRoomCancel"
    };

    jpushUtil.jpush(jpushArg);

}

