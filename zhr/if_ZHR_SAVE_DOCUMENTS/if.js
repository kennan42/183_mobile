	var MEAP = require("meap");
	var fs = require("fs");
	var path = require("path");
	var cp = require("child_process");
	var docType = '[".zip",".7z",".rar"]';
	var count = 0;
	var files = [];
	var resultArray = [];
	var srcname = "";
	var pdfname = "";
	var tmpdir = 0;
	function run(Param, Robot, Request, Response, IF){
		try {
			count = 0;
			srcname = "";
			pdfname = "";
			tmpdir = "";
			resultArray = [];
			files = [];
			var filepath = Param.files.file.path;
			var filename =  Param.files.file.name;
			var filesize =  Param.files.file.size;
			var ext = path.extname(Param.files.file.name);
			if(docType.indexOf('"'+path.extname(filename).toLowerCase()+'"') > 0){
		        Response.setHeader("Content-Type", "text/plain; charset=utf-8");
		        data = JSON.stringify({RETURN_SUBRC:-1,RETURN_MESSAGE:"该文件类型不支持图片浏览"});
		        Response.end(data);
		        return;
  		 	}
			fs.renameSync(filepath,filepath+ext);
			files.push({path:filepath+ext,type:1,name:filename});
			var fileid = filepath.substring(filepath.lastIndexOf("/") + 1);
			pdfname = filepath+".pdf";
			srcname = filepath+ext;
			
			convertFile(srcname,pdfname,fileid,function(err,res,destdir){
				if(!err)
					count = parseInt(res.pagecount);
					for(var i = 1;i<=count;i++){
						var imgName = "";
						if(i<10){
							imgName = "p" + "00" + i + ".jpg"
						}else if(i<100){
							imgName = "p" + "0" + i + ".jpg";
						}else{
							imgName = "p" + i + ".jpg";
						}
						files.push({path:destdir + "/" + imgName,type:2,name:imgName});
					}
					uploadFile(Response,files,0,IF);
					 tmpdir = destdir;
			});
		}
		catch(e)
		{
			Response.statusCode = 404;
			Response.end(JSON.stringify({
						RETURN_MESSAGE: "文件上传失败",
						RETURN_SUBRC: 1
					}));
		}
	}

	function uploadFile(Response,files,i,IF){
		i = i||0;
		if(i < files.length){
			var data = fs.readFileSync(files[i].path);
			var doc = data.toString("base64");
			var fsstat = fs.statSync(files[i].path);
			var option = {
						//wsdl:global.TX_DOMAIN_URL_PRE +  "/sap/bc/srt/wsdl/flv_10002A111AD1/bndg_url/sap/bc/srt/rfc/sap/zhrws2112/800/zhrws2112/zhrws2112?sap-client=800",
						wsdl:path.join(__dirname.replace(IF.name,""),global.wsdl,"ZHR_SAVE_DOCUMENTS.xml"),
						func: "ZHRWS2112.ZHRWS2112_soap12.ZHRWS2112",
						Params: {
							DOCUMENT: "",
							DOCUMENT2: doc,
							DOC_SIZE:fsstat.size,
							DOU_NAME: files[i].name
						},
						BasicAuth: global.TXSOAPAuth,
						agent:false
					};
					MEAP.SOAP.Runner(option, function(err, res, data){
						if (!err) {
							resultArray.push({name:files[i].name,id:data.RETRUN_DOC_ID,type:files[i].type});
							i+=1;
							uploadFile(Response,files,i,IF);
						}
						else {
							Response.statusCode = 404;
							Response.end(JSON.stringify({
								RETURN_MESSAGE: "调用webservice发生错误",
								RETURN_SUBRC: 1
							}));
						}
					});
		}else{
			uploadresult(Response,resultArray);
		}
	}

	function convertFile(srcname,pdfname,fileid,cb) {
		try {
			{
				{
					try {
						convertTxt(srcname);
						var cmd2pdf= "/opt/libreoffice4.2/program/soffice --headless --convert-to pdf:writer_pdf_Export --outdir "+"/tmp"+" "+srcname;
						cp.exec(cmd2pdf, function(err, stdout, stderr) {
							console.log("[CASE] Run cmd2pdf ", err,'stdout: ' + stdout,'stderr: ' + stderr);
							var destdir = "/tmp/"+fileid;
							fs.mkdirSync(destdir);
							var cmd2img = "/opt/ghostscript-9.14/gs -dNOPAUSE -dBATCH -sDEVICE=jpeg -sOutputFile=" + destdir + "/p%03d.jpg " + pdfname;
							cp.exec(cmd2img, function(err, stdout, stderr) {
								if ( stdout.match(/Processing pages (.*) through (.*)\./) ) {
									cb(0, {pagecount:RegExp.$2},destdir);
								}
								else
									cb(-1,"Convert File Failed");
							});
						});
					} catch(e) {
						cb(-1,e.message);
					}

				}
			}
			//);
		} catch(e) {
			cb(-1, "Conver document fail. " + e.message);
		}
	}

	function convertTxt(filename){
		if(path.extname(filename) != '.txt') return;
		var buf = fs.readFileSync(filename);
		var type = [buf[0],buf[1],buf[2]].join(''),encoding = 'UTF-8';
		switch(type){
			case '239187191' :
			break;	
			case '2542550' :
				buf = MEAP.AJAX.Convert(buf,"utf16be",encoding);
			break;	
			case '25525448' :
				buf = MEAP.AJAX.Convert(buf,"utf16le",encoding);
			break;	
			default :
				buf = MEAP.AJAX.Convert(buf,"gbk",encoding);
			break;	
		}
		fs.writeFileSync(filename,buf);
	}

	function uploadresult(Response,arr){
		fs.unlink(srcname,function(){});
		fs.unlink(pdfname,function(){});
		cp.exec("rm -rf " + tmpdir,function(err, stdout, stderr){});
		Response.setHeader("Content-type","text/json;charset=utf-8");
		Response.end(JSON.stringify(arr));
	}

exports.Runner = run;
