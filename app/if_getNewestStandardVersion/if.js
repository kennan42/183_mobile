var MEAP=require("meap");

function run(Param,Robot,Request,Response,IF)
{
    console.log("app.getNewestStandardVersion start");
    Response.setHeader("Content-type","application/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
    var platform = arg.platform;
	try{
        var option={
			CN:"Dsn=mysql-emm",
			sql:"select * from PkgFileInfo where appId = '" + global.appId 
			      + "' and  platform = '" + platform + "'  and pkgStatus = 1 order by createdAt desc limit 0,1"
		};
		MEAP.ODBC.Runner(option,function(err,rows,cols){
		    console.log("app.getNewestStandardVersion end");
			if(!err){
				Response.end(JSON.stringify({status:'0',data:rows[0]}));
			}else{
				Response.end(JSON.stringify({status:'-1',message:'Error'}));
			}
		},Robot);
	}
	catch(e)
	{
		Response.end(JSON.stringify({status:'-1',message:'Error'}));
	}
}

exports.Runner=run;

