var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../carpoolSchema.js");

/**
 * 更新车辆信息
   接口废除！
 */
function run(Param, Robot, Request, Response, IF)
{
	var car = JSON.parse(Param.body.toString());
    var db = mongoose.createConnection(global.mongodbURL);
    var CarpoolCarModel=db.model("carpoolcar",sm.CarpoolCarSchema);
    var fileURL2 = "";
    if(car.fileURL2){
        fileURL2 = car.fileURL2;
    }
    CarpoolCarModel.update({_id:car.carId},{
        carType:car.carType,
        carSeat:car.carSeat,
        carModel:car.carModel,
        carColor:car.carColor,
        carNumber:car.carNumber,
        state:1,
        carImg:car.carImg,
        fileURL:car.fileURL,
        fileURL2:fileURL2
    }).exec(function(err,doc){
        Response.setHeader("Content-type","text/json;charset=utf-8");
        db.close();
       if(!err){
            Response.end(JSON.stringify(
                {status:0,msg:'更新成功'}
            ));
        }else{
            Response.end(JSON.stringify(
                {status:-1,msg:'更新失败'}
            ));
        }
    });
	
}

exports.Runner = run;


                                

	

