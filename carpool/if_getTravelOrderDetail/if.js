var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var async = require("async");
var sm = require("../carpoolSchema.js");

/**

    司机- 接单详情
 * 作者：xialin
 * 时间：2016-04-01
 * 状态 ：已完成
   入参：  arg.travelId  :约车单ID
 *  
 * 
 * 
 */


function run(Param, Robot, Request, Response, IF)
{
	var arg = JSON.parse(Param.body.toString());
    var travelId = arg.travelId;

    var db = mongoose.createConnection(global.mongodbURL);
	
	
	
	
  
  var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);
    var carModel = db.model("carpoolCar", sm.CarpoolCarSchema);
    travelModel.find({
        _id : travelId
    }).populate("car").exec(function(err, data) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        db.close();
        if (!err ) {
          
                Response.end(JSON.stringify({
                    status : "0",
                    msg : "查询成功",
                    data : data
                }));
           

        } else {
            
            Response.end(JSON.stringify({
                status : "-1",
                msg : "查询失败"
            }));
        }
    });
	
}

exports.Runner = run;


                                

	

