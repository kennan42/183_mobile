var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm=require("./meetSchema.js");
var bSchema =require("./Contact.js"); 


var util={
    overDate:function(arg){
        var db=mongoose.createConnection(global.mongodbURL);
        var MeetBookModel=db.model("meetBook",sm.MeetBookSchema);
        MeetBookModel.update({_id:arg.arg},{state:5},function(err,data){
             db.close();
        });
    },
}
/**
 *对比数据并拼接数据 
 */
function cpmparepersondata(data1,data2){
      var newdata = [];
    for(var i in data1){
       var userid;
        if(data1[i].userId==undefined){
          continue;  
        } else{
          userid =data1[i].userId;   
        }
         if(userid.length<8){userid ="0"+userid;}
         var flag = false;
        for(var j in data2){  
             var perner ="";
			 console.log("bbbbbnnnnnnnnnnnnnnnnnnnnnnnnn:"+data2[j]);
            if(data2[j].EASY_TAB.item!=undefined&&data2[j].EASY_TAB.item[0].PERNR!=undefined){ 
                 perner=data2[j].EASY_TAB.item[0].PERNR;  
             if(userid == perner){
              var person =data2[j].EASY_TAB.item[0];   
              var pernr =getsplit(person); 
              newdata.push({"SCHEDULE":data1[i],"BUMEN":pernr}); 
              flag =true;
              continue;  
            }  
        }  
        }
        if(!flag){
           newdata.push({"SCHEDULE":data1[i],"BUMEN":"正大天晴"}); 
        } 
    }
    return newdata;
}

function getsplit(person){
    var str = "";
    var ZZ_JG5T = JSON.stringify(person.ZZ_JG5T);
    var ZZ_JG4T = JSON.stringify(person.ZZ_JG4T);
    var ZZ_JG3T = JSON.stringify(person.ZZ_JG3T);
    var ZZ_JG2T = JSON.stringify(person.ZZ_JG2T);
    var ZZ_JG1T = JSON.stringify(person.ZZ_JG1T);
    var BUTXT = JSON.stringify(person.BUTXT);
     
     if(ZZ_JG5T!="{}"&&ZZ_JG4T!="{}"){
        str =  ZZ_JG4T.substring(1,ZZ_JG4T.length-1)+"-"+ZZ_JG5T.substring(1,ZZ_JG5T.length-1);
        return str;
     } 
     else if(ZZ_JG4T!="{}"&&ZZ_JG3T!="{}"){
        str =  ZZ_JG3T.substring(1,ZZ_JG3T.length-1)+"-"+ZZ_JG4T.substring(1,ZZ_JG4T.length-1);
        return str;
     }
    else if(ZZ_JG3T!="{}"&&ZZ_JG2T!="{}"){
        str =  ZZ_JG2T.substring(1,ZZ_JG2T.length-1)+"-"+ZZ_JG3T.substring(1,ZZ_JG3T.length-1);
        return str;
     }
    else if(ZZ_JG2T!="{}"&&ZZ_JG1T!="{}"){
        str =  ZZ_JG1T.substring(1,ZZ_JG1T.length-1)+"-"+ZZ_JG2T.substring(1,ZZ_JG2T.length-1);
        return str;
     }
    else if(ZZ_JG1T!="{}"){
        str =  ZZ_JG1T.substring(1,ZZ_JG1T.length-1);
        return str;
     }else{
       str =  BUTXT.substring(1,BUTXT.length-1);
        return str;  
     } 
}


/**
 * 比对数据
 * @param {Object} data1
 * @param {Object} data2
 */
function comparedata(data1,data2){//
    var newdata = data1;
    for(var i in data1){
        for(var j in data2){
            if(data1[i].meetRoom2 == data2[j]._id){
               newdata[i].servicePersonal =  data2[j].servicePersonal;
               newdata[i].technicist =  data2[j].technicist;
               break;  
            }
        } 
    }
    return newdata;
}
/**
 *返回值是cb 
 */
function getpersonmessage(PERNR, Robot, Request, Response, IF, cb) { 
    var option = {
        method: "POST",
        url: global.baseURL + "/zhr/ZHR_GET_PER_EASY_INFO",
        Cookie: "true",
        agent: "false",
        Enctype: "application/json",
        Body: JSON.stringify({ "P_PERNR":{ "item":[{
                "PERNR":PERNR }]}})
    };

    MEAP.AJAX.Runner(option, function (err, res, data) {
        if (err != null) {
            cb(err, 0);
            return
        }  
        data = JSON.parse(data);
        cb(err, data);
    }, Robot);

}

/**
 *返回值是电话号码
 */
function getpersonmessage1(PERNR,name, Robot, Request, Response, IF,cb) { 
    var newdata;
    var option = {
        method: "POST",
        url: global.baseURL + "/zhr/ZHR_GET_PER_EASY_INFO",
        Cookie: "true",
        agent: "false",
        Enctype: "application/json",
        Body: JSON.stringify({ "P_PERNR":{ "item":[{
                "PERNR":PERNR }]}})
    }; 
	
    MEAP.AJAX.Runner(option, function (err, res, data) {
        if (err != null) { 
             cb(err, 0);
            return;
        }   
        data =JSON.parse(data); 
		if(data.RETURN_MESSAGE!="S"){
			        cb("",{
            "userId":PERNR,
            "userName":name,
            "tel":"",
            "ZZ_JG1T" :"",
            "PLSTX" :""
        });
		}else{
			        cb("",{
            "userId":PERNR,
            "userName":name,
            "tel":data.EASY_TAB.item[0]!=undefined?data.EASY_TAB.item[0].TELL:"",
            "ZZ_JG1T" : data.EASY_TAB.item[0]!=undefined?data.EASY_TAB.item[0].ZZ_JG1T:"",
            "PLSTX" :data.EASY_TAB.item[0]!=undefined?data.EASY_TAB.item[0].PLSTX:""
        });
		}

    }, Robot);  
}

/**
 *从mas服务器获取数据 
 */
function getperson(PERNR,Robot, Request, Response, IF,cb) {  
    if (PERNR.length == 7) {
            PERNR = "0" + PERNR;
        }  
    var conn = mongoose.createConnection(global.mongodbURL);
    var baseUserModel = conn.model("base_user", bSchema.BaseUserSchema);
    baseUserModel.find({ "PERNR" : PERNR},
         {"PERNR" : 1,"NACHN" : 1,"ZZ_JG1T" : 1,"ZZ_TEL" : 1,
                      "photoURL2" : 1,"photoURL" : 1,"STLTX":1}, function(err, data) {
        conn.close();   
        //data =JSON.parse(data); 
        cb("",data[0]);
    });   
}

/**
 *从monogdb获取人员相关信息 
 */
 
function getPersonFromMas(item, Robot, Request, Response, IF,cb){ 
 //   Response.setHeader("Content-Type", "text/json;charset=utf-8"); 
 var userId =item.userId;
    if (userId!=undefined&&userId.length == 7) {
            userId = "0" + userId;
         
    var conn = mongoose.createConnection(global.mongodbURL);
    var baseUserModel = conn.model("base_user", bSchema.BaseUserSchema);
    baseUserModel.find({ "PERNR" : userId},
         {"PERNR" : 1,"NACHN" : 1,"ZZ_JG1T" : 1,"ZZ_TEL" : 1,
                      "photoURL2" : 1,"photoURL" : 1,"STLTX":1}, function(err, data) {
        conn.close();   
        cb("",{"MEETBOOK":item,"PERSON":data[0]}); 
    }); 
    }else{
        cb("",{"MEETBOOK":item,"PERSON":""}); 
    }
}
   
//对比数据并组装数据
function changeMeetRoomtodata(data1,data2){
     var newdata =[];//时间为0的会议室 
                  var xxdata =[];
                 for(var i in data2){ 
                     for(var j in data1){ 
                     if(data1[j]._id == data2[i]._id){ //拼接有预定的会议室
                         xxdata.push({"MEETROOM":data1[j],"HOURS": data2[i].HOURS,"TIMES":data2[i].TIMES});
                         break;
                      }  
                     }  
                 }   
                  for(var i in data1){
                      var chose =true;
                     for(var j in data2){ 
                     if(data1[i]._id == data2[j]._id){
                         chose =false;
                         break;
                      }  
                     } 
                     if(chose){
                       newdata .push({"MEETROOM":data1[i],"HOURS": 0,"TIMES":[]}); 
                     } 
                 }
                 for(var x in xxdata){
                    newdata.push(xxdata[x]); 
                 }
                 return newdata;
    
}
//根据时间戳获取当天最大时间戳
function getMaxtimeformdata(startTime){
        var date = new Date();
        date.setTime(startTime);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(1);
        return date.getTime();
}
//根据时间戳获取当天最小时间戳
function getmintimeformdata(startTime){
     var date = new Date();
        date.setTime(startTime);
        date.setHours(23);
        date.setMinutes(59);
        date.setSeconds(59);
        date.setMilliseconds(999);
        return date.getTime();
}
/**
 *开始时间，结束时间，数据 
 * @param {Object} starttime
 * @param {Object} endtime
 * @param {Object} datas
 */
function getArrayFromDataBytimes(starttime,endtime,datas){
    starttime =starttime+1000;
    endtime =endtime-1000;
    var newdatas =[];
    for(var i =0;i<datas.length;i++){
        //获取单个会议室的具体详情信息对比 
        var datatime = datas[i].TIMES; 
        if(datatime.length==0){
          newdatas.push(datas[i]);  
        }else{
            var chose =true;
            for(var j=0;j<datatime.length;j++){
                var stime =datatime[j].startTime;
                var etime =datatime[j].endTime; 
               if(starttime<etime&&endtime>stime){//有重 
                   chose =false;
                   break;
               } else{ 
                   continue;
               } 
            } 
            if(chose){ 
             newdatas.push(datas[i]);   
            } 
        } 
    }
    return newdatas;
}



function getDateStartTime(date){
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
}
 
function getMMddHHmmFromTimes(times) {
        var date = new Date();
        date.setTime(times);
        var year = date.getYear()+1900;
        var month = date.getMonth() + 1 + "";
        var curDate = date.getDate() + "";
        var hour = date.getHours() +"";
        var minute = date.getMinutes() + "";
        return year+"年"+month + "月" + curDate + "日 " + hour + ":" + minute;

    }

/**
 *返回值是电话号码
 * 
 */
function sendmessage(Param, Robot, Request, Response, IF,cb) { 
    var newdata;
    var option = {
        method: "POST",
        url: global.baseURL + "/meet/sendSMS",
        Cookie: "true",
        agent: "false",
        Enctype: "application/json",
        Body: JSON.stringify(Param)
    }; 
    MEAP.AJAX.Runner(option, function (err, res, data) {
        if (err != null) { 
             cb(err, 0);
            return;
        }     
    }, Robot);  
}
exports.getperson =getperson;
exports.sendmessage =sendmessage;
exports.getMMddHHmmFromTimes =getMMddHHmmFromTimes;  
exports.getDateStartTime =getDateStartTime;
exports.getArrayFromDataBytimes =getArrayFromDataBytimes;
exports.changeMeetRoomtodata = changeMeetRoomtodata;
exports.getpersonmessage =getpersonmessage;
exports.getpersonmessage1 =getpersonmessage1;
exports.getPersonFromMas =getPersonFromMas;
exports.cpmparepersondata =cpmparepersondata; 
exports.comparedata =comparedata;
exports.overDate=util.overDate;
exports.getMaxtimeformdata =getMaxtimeformdata;
exports.getmintimeformdata =getmintimeformdata; 