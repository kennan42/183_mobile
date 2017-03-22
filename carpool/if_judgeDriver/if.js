var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../carpoolSchema.js");
var async = require("async");

/**
 *
 * 判断司机有没有注册个人信息和车辆信息
 * 1.如果有车辆信息，无个人信息         返回0
 * 2.如果两者都没有                                      返回1
 * 作者：xialin
 * 时间：20160408
 *
 */
var arg = null;
var db = null;
function run(Param, Robot, Request, Response, IF) {

    arg = JSON.parse(Param.body.toString());
    db = mongoose.createConnection(global.mongodbURL);
    main(Response);

}

function main(Response) { 
    async.parallel([ getDriverYear, getMyCars], function(err, data) {

        Response.setHeader("Content-type", "text/json;charset=utf-8");
        db.close();
        if (!err) {
            
            
            Response.end(JSON.stringify({
                status : "0",
                msg : "查询成功",
                msgStatus : "S4000112",
               
                userInfo:data[0],
                carInfo:data[1]

            }));
        } else {
            Response.end(JSON.stringify({
                status : "-1",
                msgStatus : "E4000120",
                msg : "查询失败"
            }));
        }
    });
}

//查看驾龄支付宝等信息    根据公司字段查询
function getDriverYear(callback) {
    var CarpoolUserModel = db.model("carpoolUser", sm.CarpoolUserSchema);
    //用户信息
    CarpoolUserModel.find({
        userId : arg.userId,
        company : arg.company
    }).exec(function(err, data) {
        var result =0;
        if(data.length>0){
            result=1;
        }
        callback(err, data);
    });

}

//查看车辆信息
function getMyCars(callback) {
    var CarpoolCarModel = db.model("carpoolcar", sm.CarpoolCarSchema);
    var CarpoolAttachmentModel = db.model("carpoolAttachment", sm.CarpoolAttachmentSchema);
    CarpoolCarModel.find({
        carOwnerId : arg.userId,
        company : arg.company,
        state : 1
    }).populate("carImg").exec(function(err, data) {
       var result =0;
        if(data.length>0){
            result=1;
        } 
        callback(err, data);
    });
}

exports.Runner = run;

