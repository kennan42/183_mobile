var MEAP=require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../carpoolSchema.js");

function run(Param, Robot, Request, Response, IF)
{
     var arg = JSON.parse(Param.body.toString());   
    db = mongoose.createConnection(global.mongodbURL);
    var autoPublishTravelModel = db.model("carpoolAutoPublishTravel", sm.CarpoolAutoPublishTravelSchema);
    db.update({_id:arg.id},
              {
                  startProvince:arg.startProvince,
                  startCityCode:arg.startCityCode,
                  startCity:arg.startCity,
                  startAddress:arg.startAddress,
                  arriveProvince:arg.arriveProvince,
                  arriveCityCode:arg.arriveCityCode,
                  arriveCity:arg.arriveCity,
                  arriveAddress:arg.arriveAddress,
                  startTime:arg.startTime,
                  seatCount:parseInt(arg.seatCount),
                  filter:arg.filter,
                  frequency:arg.frequency,
                  updateTime:new Date().getTime(),
                  remark:arg.remark
              },
              function(err){
                db.close();
                if(!err){
                    Response.end(JSON.stringify({
                        status:"0",
                        msg:"更新成功"
                    }));
                }else{
                    Response.end(JSON.stringify({
                        status:"-1",
                        msg:"更新失败"
                    }));
                }
        
    });
}

exports.Runner = run;


                                

	

