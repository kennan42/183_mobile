var MEAP=require("meap");

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../newsSchema.js");

/**
 * 
 * 新闻点击数
 * 作者：xialin
 * 时间：20160929
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param, Robot, Request, Response, IF)
{
	
	 var arg = JSON.parse(Param.body.toString());
	 var cid =arg.cid; //
	
	 
	 var db = mongoose.createConnection(global.mongodbURL);
     var newsModel = db.model("newsClick", sm.NewsClickSchema);
	 
	 newsModel.update({"cid":cid},{$inc:{"number_click":1}},{"upsert" : true}).exec(function (err,data){
		 db.close();
		 if(!err){
			   Response.end(JSON.stringify({status:0, message:"Success"})); 
		 }else{
			    Response.end(JSON.stringify({status:-1, message:"err"})); 
		 }
	 });
	
	
    //Add your normal handling code 
  
}

exports.Runner = run;