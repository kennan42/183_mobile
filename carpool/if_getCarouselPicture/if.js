var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var sm = require("../carpoolSchema.js");


 
/**
 *功能：获取轮播图图片 
 *作者：xialin
 * 时间：20160419
 */
function run(Param, Robot, Request, Response, IF)
{
	
	var db = mongoose.createConnection(global.mongodbURL);
                
    //保存图片附件地址信息
    var CarpoolPictureModel = db.model("carpoolPicture", sm.CarpoolPictureSchema);
	//查找轮播图片
	CarpoolPictureModel.find({tag:1}).exec(function(err,data){
	    db.close();
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err) {
            Response.end(JSON.stringify({
                status : "0",
                msg : "查询成功",
                msgStatus:"S4000111",
                data : data
            }));
        } else {
            Response.end(JSON.stringify({
                status : "-1",
                msg : "查询失败",
                msgStatus:"E4000111"
            })); 
        }
	    
	});
	
	
}

exports.Runner = run;


                                

	

