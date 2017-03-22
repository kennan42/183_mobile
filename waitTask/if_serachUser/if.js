var MEAP=require("meap");

/*
 * 搜索人员的公共控件(搜索人员公共接口)
 * author:zrx
 * time:2016-12-21
 */
function run(Param, Robot, Request, Response, IF)
{
	var arg = JSON.parse(Param.body.toString());
	var stext = arg.stext;
	var TOPN1 =arg.TOPN1;//人员列表记录条数
	var TOPN2 =arg.TOPN2;//部门列表记录条数
	 
	//http://10.10.1.104:8000/cttqdc/services/erp/hr/userSearch.xsjs?&STEXT=信息部
	var url = global.baseHANA+"/cttqdc/services/erp/hr/userSearch.xsjs?&STEXT="+stext;
	if(TOPN1!=undefined&&TOPN1!=""){
	   url +="&TOPN1="+TOPN1; 
	}
	if(TOPN2!=undefined&&TOPN2!=""){
	    url +="&TOPN2="+TOPN2;  
	}
	var option={
	    //agent : false,
		method : "GET",
		url : url,
		BasicAuth : global.HanaAuth
	};
	
	MEAP.AJAX.Runner(option,function(err,res,data){
	    Response.setHeader("Content-type", "text/json;charset=utf-8");
        if(!err)
	    {
	        //console.log(data);
	          console.log(data);
	        Response.end(JSON.stringify({
                   status:0,
                   data:data
               }));
			//Add your normal handling code
	    }
	    else
	    {
	        Response.end(JSON.stringify({
                   status:-1,
                   message:"查询HANA出错"
               }));
			//Add your exception handling code 
	    }
	},Robot);
}

exports.Runner = run;


                                

	

