var MEAP=require("meap");
var mongoose = require("mongoose");
var async = require("async");
var appversionSchema = require("../BaseVersion.js");

/**
 * 添加app版本信息
 * @param {Object} Param
 * @param {Object} Robot
 * @param {Object} Request
 * @param {Object} Response
 * @param {Object} IF
 */
function run(Param, Robot, Request, Response, IF)
{
    console.log("app.addAppMessage start");
     Response.setHeader("Content-Type", "text/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var versionid = arg.versionid;//版本号
    var versionName = arg.versionName;//版本名称
    var appName = arg.appName;//app名称
    var updateMsg = arg.updateMsg;//版本升级说明
    var systemtype = arg.systemtype;//IOS /android
    if(versionid==null||versionid==''){
             Response.end(JSON.stringify({
                            "status" : "-1",
                            "msg" : "请正确填写版本号"
                              }));
              return;
    }
    if(versionName==null||versionName==''){
             Response.end(JSON.stringify({
                            "status" : "-1",
                            "msg" : "请正确填写版本名称"
                              }));
              return;
    }
    if(appName==null||appName==''){
             Response.end(JSON.stringify({
                            "status" : "-1",
                            "msg" : "请正确填写app名称"
                              }));
              return;
    }
    if(updateMsg==null||updateMsg==''){
             Response.end(JSON.stringify({
                            "status" : "-1",
                            "msg" : "请正确填写版本升级说明"
                              }));
              return;
    }
    if(systemtype==null||systemtype==''){
             Response.end(JSON.stringify({
                            "status" : "-1",
                            "msg" : "请正确选择平台"
                              }));
              return;
    }
    var uploadDate =  new Date().getTime();//更新时间
    var coon = mongoose.createConnection(global.mongodbURL);
    var appVersionModel = coon.model("app_version", appversionSchema.appversionSchema);
    //先判断此版本是否存在，存在就修改，否者就新增
    appVersionModel.find({"versionid":versionid,"systemtype":systemtype}).exec(function(err, data){
        if(!err){
            console.log("data",data);
            if(data!=null&&data.length!=0){//不等于null就新增
                appVersionModel.update(
                    {"versionid":versionid,"systemtype":systemtype},
                    {"versionName":versionName,//版本名称
                     "appName":appName,//app名称
                     "updateMsg":updateMsg,//版本升级说明
                     "uploadDate":uploadDate//更新时间
                    },function(err){
                     coon.close();
                     if(!err){
                        Response.end(JSON.stringify({
                            "status" : "0",
                            "msg" : "更新成功"
                              }));  
                     }else{
                       Response.end(JSON.stringify({
                             "status" : "-1",
                             "msg" : "更新失败"
                         }));   
                     }
                });
            }else{
               var appVersionModel1 = new appVersionModel({
                     "versionid":versionid,//版本号
                     "versionName":versionName,//版本名称
                     "appName":appName,//app名称
                     "updateMsg":updateMsg,//版本升级说明
                     "uploadDate":uploadDate,//更新时间
                     "systemtype":systemtype//app是android还是ios
                  });
          appVersionModel1.save(function(err, data) {
            coon.close();
            if(!err){
                Response.end(JSON.stringify({
                   "status" : "0",
                   "msg" : "新增成功"
                  })); 
            }else{
                 Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "新增失败"
              }));
            }
        }); 
            }
        }else{
            coon.close();
            Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "查询失败"
        }));
        }
    });
}

exports.Runner = run;


                                

	

