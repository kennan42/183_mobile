var MEAP = require("meap");
var path = require("path");

/**
 * 查询司领报销单接口
 * @author donghua.wang
 * @date 2015年05月28日 13:29
 * */
function run(Param, Robot, Request, Response, IF) {
    var arg = JSON.parse(Param.body.toString());
    var paramJSON = {
        "DYFLG":"",
        "IS_PUBLIC":{
          "FLOWNO":"",
          "PERNR":"",
          "ZDOMAIN":"",
          "I_PAGENO":"",
          "I_PAGESIZE":""  
        },
        "KEYDATE":arg.KEYDATE,
        "P_ORGEH":{
            "item":[]
        },
        "P_PERNR":{
            "item":[{"PERNR":arg.PERNR}]
        }
    };
    var option = {
        //wsdl:"http://cttqdev.cttq.com:8000/sap/bc/srt/wsdl/flv_10002A111AD1/bndg_url/sap/bc/srt/rfc/sap/zhrws_dynamic_person/800/zhrws_dynamic_person/zhrws_dynamic_person?sap-client=800",
        wsdl : path.join(__dirname.replace(IF.name, ""), global.wsdl, "zhrws_dynamic_person.xml"),
        func : "ZHRWS_DYNAMIC_PERSON.ZHRWS_DYNAMIC_PERSON.ZHRWS_DYNAMIC_PERSON",
        Params : paramJSON
    };

    MEAP.SOAP.Runner(option, function(err, res, data) {
        Response.setHeader("Content-Type", "text/json;charset=utf-8");
        if (!err) {
            var arr = [];
            if(data.ET_ZHR_ALL_INFO.item != null){
                for(var i in data.ET_ZHR_ALL_INFO.item){
                     var item = data.ET_ZHR_ALL_INFO.item[i];
                     arr.push({"ZZ_YGSL":item.ZZ_YGSL,"ZZ_BXLB":item.ZZ_BXLB,"BUKRS":item.BUKRS,"ZZ_CZDA_T":item.ZZ_CZDA_T});
                }
            }
            Response.end(JSON.stringify({
                "status" : "0",
                "msg" : "success",
                "ES_PUBLIC":data.ES_PUBLIC,
                "ET_ZHR_ALL_INFO":arr
            }));
        } else {
            console.log("getSilingInfo err--->", err);
            Response.end(JSON.stringify({
                status : '-1',
                message : 'Error'
            }));
        }
    });
}

exports.Runner = run;
