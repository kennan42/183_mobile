var mongoose = require("mongoose");
var appSchema = require("./AppSchema.js");

//添加app访问页面日志
function addAppVisitPageLog(arg){
    var userId = arg.userId;
    if(userId == null){
        console.log("userId is null");
        return;
    }
    var page = arg.page；
    if(page == null){
        console.log("page is null");
        return;
    }
    var module = arg.module;
    if(module == null){
        console.log("module is null");
        return;
    }
}

//添加app功能访问日志
function addAppFuncUseLog(arg){
    
}
