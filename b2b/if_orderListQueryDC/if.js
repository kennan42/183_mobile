var MEAP = require("meap");
var xml2js = require('xml2js');

function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type", "application/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
    

     
      var KUNNR_IN = arg.KUNNR_IN;
      var PARNR_IN = arg.PARNR_IN;
      var VBELN =arg.VBELN;
      var STATUS = arg.STATUS;
      var SRDATE = arg.SRDATE;
      var ERDAT = arg.ERDAT;
      var top = arg.top;
      var skip = arg.skip;

      var url =global.baseHANA+ "/cttqdc/services/erp/sd/salesorders/orderListQueryDC.xsodata/Input(KUNNR_IN='*"+KUNNR_IN+"*',PARNR_IN='"+PARNR_IN+"')/Results?$filter=";
     
      var flag =true;
      var x =0;

      if(SRDATE!=null&&SRDATE!=''){
          flag =false;  
          if(x==0){
            x =1;
          }
      }

      if(ERDAT!=null&&ERDAT!=''){
          flag =false; 
          if(x==0){
            x =2;
          } 

      }
     
      if(VBELN!=null&&VBELN!=''){
          flag =false; 
          if(x==0){
            x =3;
          } 

      }
      
      
      
      if(STATUS!=null&&STATUS!=''){
          flag =false;
          if(x==0){
              x=4;
          }
      }
      
      
     console.log(1111);
     if(flag){
       url =global.baseHANA+ "/cttqdc/services/erp/sd/salesorders/orderListQueryDC.xsodata/Input(KUNNR_IN='*"+KUNNR_IN+"*',PARNR_IN='"+PARNR_IN+"')/Results?";
     
     }else{
        if(x ==1){ 
         url+= "ERDAT gt '" +SRDATE+"'";
         
           if(ERDAT!=null&&ERDAT!=''){
                             
            url+= " and ERDAT lt '" +ERDAT+"'";
           }
           if(VBELN!=null&&VBELN!=''){
        
           url+= " and VBELN eq '" +VBELN+"'";
         }
         
         if(STATUS!=null&&STATUS!=''){
        
           url+= " and STATUS eq '" +STATUS+"'";
         }


        }else if(x==2){
          url+= 'ERDAT lt ' +ERDAT;
          if(VBELN!=null&&VBELN!=''){
        
         url+= " and VBELN eq '" +VBELN+"'";
         }
         if(STATUS!=null&&STATUS!=''){
        
           url+= " and STATUS eq '" +STATUS+"'";
         }
        }else if(x==3){
          url+= "VBELN eq '" +VBELN+"'";
          if(STATUS!=null&&STATUS!=''){
        
           url+= " and STATUS eq '" +STATUS+"'";
         }
        }else if(x==4){
            url+= "STATUS eq '" +STATUS+"'";
            
        }
       
     

     }
     
    console.log(url);

     

      var url2 ='&$top='+top+'&$skip='+skip+'&$orderby=ERDAT desc,VBELN desc&$format=json';
      
       url+=url2; 

      console.log(url) ;
//url = url.replace(/'/g, "%27").replace(/ /g, "%20").replace(/([\u4e00-\u9fa5]+)/g, encodeURI("$1"));

    var option = {
        agent: false,
        method: "GET",
        url: url,
        
          BasicAuth : global.HanaAuth
    };
 
    MEAP.AJAX.Runner(option, function (err, res, data) {
        if (!err) {
            console.log(data);
           // xml2js.parseString(data, function (e, r) {
                Response.end(JSON.stringify({
                    "status": "0",
                    "data": JSON.parse(data)
                }));
          //  });

        } else {
            Response.end(JSON.stringify({
                "status": "-1"
            }));
        }
    }, Robot);
}

exports.Runner = run;

