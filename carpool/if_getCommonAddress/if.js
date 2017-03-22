var MEAP=require("meap");
var mongoose = require("mongoose");
var sm = require("../carpoolSchema.js");

/**
 * 
 * 功能：获取常用的出发地址和目的地址
 * 这里固定四个区域，根据公司常态来选
 * 通过数据库来配置信息
 * 作者：xialin
 * 时间：20160331 
 * 
 */

function run(Param, Robot, Request, Response, IF)
{
	console.log("get CommonAddress---------->"); 
	var arg = JSON.parse(Param.body.toString());
	var company =arg.company; //获取公司
	var db = mongoose.createConnection(global.mongodbURL);
	var addressModel = db.model("commonAddress", sm.CommonAddressSchema);
	
	addressModel.find({"company":company},{_id:0}).exec(function(err, data){
		db.close();
		
		if(!err){ 
			Response.end(JSON.stringify({
                status:0,
                msgStatus:"S4000102",
                msg:"查询常用地址成功",
                data:data
            }));
			 
			
		}else{
			Response.end(JSON.stringify({
                status:-1,
                msgStatus:"E4000102",
                msg:"查询常用地址失败" 
                
            })); 
		}
	});
	
	
	
	
}

exports.Runner = run;


                                

	

