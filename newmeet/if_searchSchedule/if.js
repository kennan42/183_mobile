var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../meetSchema.js");
var async = require("async");
var util = require("../util.js");
/**
 * 查询某个预定的详情信息
 * zrx改
 * 2016-9-27
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var db = mongoose.createConnection(global.mongodbURL);
    var MeetBookModel = db.model("meetBook", sm.MeetBookSchema);
    var meetRoomModel = db.model('meetRoom', sm.MeetRoomSchema);
    MeetBookModel.findById(arg.scheduleId).populate("meetRoom").exec(function(err, data) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        var meetRoom = data.meetRoom;
        var technicist = meetRoom.technicist;
        var servicePersonal = meetRoom.servicePersonal;
		data.technicist = technicist;
		data.servicePersonal = servicePersonal;
        if (!err) {
            if (data.multi != null && data.multi == 1) {
                MeetBookModel.find({
                    "createTime" : data.createTime,
                    "meetRoom2" : {
                        "$ne" : data.meetRoom2
                    }
                }, {
                    "name" : 1
                }, function(err, data1) {
                    db.close();
                    Response.end(JSON.stringify({
                        status : 0,
                        msg : "查询成功",
                        data : data,
                        otherMeetRooms : data1
                    }));
                });
            } else {
                db.close();
                //把与会人员的信息查询出来
                if(data.participants.length!=0){
                var teldata =[];
              async.map(data.participants, function(item, callback) { 
             util.getperson(item.userId,Robot, Request, Response, IF, callback);
          }, function(err,results) { //对比并得出值   
               teldata.push(results);  
               data.participants = results;
                     Response.end(JSON.stringify({
                                    status:0,
                                    msg:"查询成功",
                                    data:data  
                                             })); 
                });  
            } else{
               Response.end(JSON.stringify({
                    status : 0,
                    msg : "查询成功",
                    data : data
                })); 
            }
              
            }
        } else {
            db.close();
            Response.end(JSON.stringify({
                status : -1,
                msg : "查询失败"
            }));
        }
    });
}

exports.Runner = run;

