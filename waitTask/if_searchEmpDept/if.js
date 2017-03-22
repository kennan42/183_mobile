var MEAP=require("meap");

/*
 * 员工部门查询的公共控件(员工部门查询接口)
 * author:zrx
 * time:2016-12-21
 */
function run(Param, Robot, Request, Response, IF)
{
    var arg = JSON.parse(Param.body.toString());
    var TYPE = arg.TYPE;//查询类型(P：人员工号、D：部门编码)
    var CODE = arg.CODE;//参数编码(P：人员工号，如：08102406;D：部门编码，如：00000247)
    var DATE = arg.DATE;//关键日期，可选(默认：当前日期，格式20161225)
    var TOPN1 = arg.TOPN1;//返回人员列表记录条数，可选
    var TOPN2 = arg.TOPN2;//返回部门列表记录条数，可选
    //'http://10.10.1.104:8000/cttqdc/services/erp/hr/empDeptSearch.xsjs?TYPE=D&CODE=00000371&TOPN1=5&TOPN2=3
    var url = global.baseHANA+"/cttqdc/services/erp/hr/empDeptSearch.xsjs?&TYPE="+TYPE+"&CODE="+CODE;
    if(TOPN1!=undefined&&TOPN1!=""){
       url +="&TOPN1="+TOPN1; 
    }
    if(TOPN2!=undefined&&TOPN2!=""){
       url +="&TOPN2="+TOPN2;  
    }
    if(DATE!=undefined&&DATE!=""){
       url +="&DATE="+DATE;   
    }
     console.log(url);
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
            console.log(JSON.parse(data));
            var data = JSON.parse(data);
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


                                

    

