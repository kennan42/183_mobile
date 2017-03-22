var MEAP=require("meap");
var redis = require("meap_redis");
var mongoose = require("mongoose");
var async = require("async");

var sm = require("../carpoolSchema.js"); 
var util = require("../util.js");
 //日期的模块
var moment = require('moment');



/**
 * 
 * 功能：按照上班时间、 地区、确定行程等条件进行查找行程,分页
 * 作者：xialin
 * 时间： 20160401
 * 
 */
function run(Param, Robot, Request, Response, IF)
{   
  

	var arg = JSON.parse(Param.body.toString());
	var pageNumber = parseInt(arg.pageNumber);
	var pageSize = parseInt(arg.pageSize);
	var skipNumber = (pageNumber - 1)*pageSize;
	
	var  startTimeTag =arg.startTimeTag;   // 0：上班时间：6:30-8:30  1：下班时间:17:00 -19:00  2：其他时间  3：全部时间 
	
	
	
	
	var  startDateHour ="";  //出发时间, 时间段的
	if(arg.startDateHour!=""){
		startDateHour=arg.startDateHour;
	}
	

	
	
	var carpoolType =arg.carpoolType;  //行程类型   1:确定行程  2：不确定行程  3.约车行程  0：全部行程
	
	var  where ={};
	if(startTimeTag==0){
		//上班时间：6:30-8:30
		  where ={startDateHour:{$gte:630,$lte:830}};
	}else if(startTimeTag==1){
		//下班时间:17:00 -19:00
		 where ={startDateHour:{$gte:1700,$lte:1900}};
	}else if(startTimeTag==2){
		//其他时间
	    where ={$or:[{startDateHour:{$gte:0000,$lte:630}},{startDateHour:{$gte:830,$lte:1700}},{startDateHour:{$gte:1900,$lte:2400}}]};
	}
	
	
	var  startAddress  ="";   //出发地区
	if(arg.startAddress!=""){
		//如果是空，全部地址
		
		startAddress = new RegExp(arg.startAddress);
		where["startAddress"]=startAddress;
	}
	
	var  arriveAddress  ="";   //目的地区
	if(arg.arriveAddress!=""){
		//如果是空，全部地址
		arriveAddress=new RegExp(arg.arriveAddress);
		where["arriveAddress"]=arriveAddress;
	}
	
	
    
	if(carpoolType==1||carpoolType==2||carpoolType==3){
		//确定行程
		where["carpoolType"]=carpoolType;
	}
	
	if(carpoolType==2||carpoolType==3){
		//如果是司机发起的不确定行程或乘客发起的约车行程，判断是否超过截止时间
		where["setCloseTime"]={$gte:new Date().getTime()};
		
	}else {
		 //拼车或全部
		where["startDate"]={$gte:new Date().getTime()};
	}
	
	console.log("================");
	console.log(where);
	
	
	
	var db = mongoose.createConnection(global.mongodbURL);
	
	var travelModel = db.model("carpoolTravel", sm.CarpoolTralvelSchema);

	travelModel.find(where).skip(skipNumber).limit(pageSize).sort({startDate:1}).exec(function(err,data){
	
	
	    db.close();
	    Response.setHeader("Content-type","text/json;charset=utf-8");
	    if(!err){
			//
			if(carpoolType==0){
				//去除时间超过截止时间的
				var data2=[];
				var nowTime =new Date().getTime();
				for(var i in data){
					if(data[i].setCloseTime>nowTime){
						data2.push(data[i]);
					}
				}
				Response.end(JSON.stringify({
	            status:"0",
	            msg:"查询成功",
				msgStatus:"S4000106",  //msg状态码
	            data:data2
	        }));
				
			}else{
			    Response.end(JSON.stringify({
	            status:"0",
	            msg:"查询成功",
				msgStatus:"S4000106",  //msg状态码
	            data:data
	        }));
				
			}
			
			
	       
	    }else{
	        Response.end(JSON.stringify({
                status:"-1",
				msgStatus:"E4000106",  //msg状态码
                msg:"查询失败"
            }));
	    }
	});

}

exports.Runner = run;


                                

	

