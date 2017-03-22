var MEAP=require("meap");
var path = require("path");
var fs = require('fs');
var gm = require("gm");
var imageMagick = gm.subClass({
    imageMagick: true
});
var returnData = null;
var personPhotos = null;

function run(Param,Robot,Request,Response,IF)
{
	var arg = JSON.parse(Param.body.toString());
	var option={
		wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"ZHRMMS_PERNR_EE_LIST.xml"),
		func:"ZHRWSMSS08.ZHRWSMSS08_soap12.ZHRWSMSS08",
		Params:arg,
		BasicAuth:global.TXSOAPAuth,
		agent:false
	};
	
	MEAP.SOAP.Runner(option,function(err,res,data){
		if(!err)
		{
			returnData = data;
			personPhotos = [];
			var personList = data.PLANS;
			getPersonPhotoUrl(Response,IF,personList,0,personPhotos);
		}
		else
		{
			Response.end(JSON.stringify({status:'-1',message:'Error'}));
		}
	});
}

	function getPersonPhotoUrl(Response,IF,personList,i,personPhotos){
		i = i||0;
		if(i<personList.length){
			var reqJSONData = {"IT_EXTENDMAP":{
												"item": [{
													"FIELDNAME":'',
													"VALUE":''
												}]
												},
							"I_PUBLIC":{
								"CHANNELSERIALNO":'',
								"ORIGINATETELLERID":'',
								"ZDOMAIN":'100',
								"I_PAGENO":'',
								"I_PAGESIZE":'',
								"ZVERSION":''
							},
							"P_PERNR":personList[i].PERNR
						};
						
			var option={
	       	 	wsdl: path.join(__dirname.replace(IF.name, ""), global.wsdl, "ZHRMMS_READ_PHOTO.xml"),
	        	func: "ZHRWSMSS05.ZHRWSMSS05_soap12.ZHRWSMSS05",
	        	Params: reqJSONData,
	        	BasicAuth: global.TXSOAPAuth,
	        	agent:false
			};
			MEAP.SOAP.Runner(option,function(err,res,data){
			if(!err)
			{
				var itemObj = null;
				var CODE = data.CODE;
				if(CODE == '1'){// NO PHOTO
					itemObj = {"personId":personList[i].PERNR,"flag":"1"};
				}else{
					var originalBuffer = new Buffer(data.B64DATA, "base64");
		            var originalImg = "/tmp/original_" + i + ".jpg";
		            var compressedImg = "/tmp/compressed_" + i + ".jpg";
		            fs.writeFileSync(originalImg, originalBuffer);
		            var imgBuffer = imageMagick(originalImg);
		            imgBuffer.resize(96, 128, "!");
		            imgBuffer.write(compressedImg, function(err){
		               var compressedBuffer = fs.readFileSync(compressedImg);
					   itemObj = {"personId":personList[i].PERNR,"flag":"0","imgBuffer":compressedBuffer};
					   fs.unlink(originalImg,function(err){});
					   fs.unlink(compressedImg,function(err){});
		            });
				}
				personPhotos.push(itemObj);
				i+=1;
				getPersonPhotoUrl(Response,IF,personList,i,personPhotos);
			}
			else
			{
				Response.setHeader("Content-type","text/json;charset=utf-8");
				Response.end(JSON.stringify({status:'-1',message:'Error'}));
			}
		});
	}else{
		Response.setHeader("Content-type","text/json;charset=utf-8");
		var returnData2 = {
			"E_PUBLIC":returnData.E_PUBLIC,
			"TAB_INFO":returnData.TAB_INFO,
			"personPhots":personPhotos,
			"return_code":"0"
			
		};
		Response.end(JSON.stringify(returnData2));
	}

}

exports.Runner = run;
