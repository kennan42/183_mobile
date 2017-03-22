var MEAP=require("meap");
var mongoose = require("mongoose");
var async = require("async");
var baseUserDao = require("../_dao/baseUserDao.js");
var easemobService = require("../../qx/_service/easemobService.js");

var baseUserService = {
    createEasemobUsersFromBaseUsers:function(cb){
        async.waterfall([
            //计算count
            baseUserDao.countBaseUsers,
            //分页创建环信用户
            function(count,cb){
                if(count>0){
                    var pageArr = new Array();
                    var pageSize = 50;
                    console.log("共有"+Math.ceil(count/pageSize)+"页环信用户");
                    // for(var i=0; i<1; ++i){
                    for(var i=0; i<Math.ceil(count/pageSize); ++i){
                        var page = {
                            pageSize:pageSize,
                            pageNumber:i+1,
                            count:count
                        };
                        pageArr.push(page);
                    }
                    var queue = async.queue(function(page,cb){
                        console.log("开始创建第"+ page.pageNumber +"页环信用户");
                        baseUserDao.getBaseUsersByPage(page,function(err,users){
                            if(!err && users.length>0){
                                easemobService.createUsers(users,function(err,data){
                                    if(err){
                                        console.log("创建环信用户失败"+data);
                                    }else{
                                    }
                                    cb(0,data);
                                });                            
                            }else if(err){
                                cb(err,"can not access getBaseUsersByPage.");
                            }else{
                                cb(null,"there is no users from getBaseUsersByPage.");
                            }
                        });
                    },1);
                    queue.push(pageArr);
                    queue.drain = function(){
                        console.log("queue end.");
                        cb(0,"queue end.");
                    };
                }
            }
        ],function(err,data){
            cb(err,data);
        });
    }
};
exports.createEasemobUsersFromBaseUsers = baseUserService.createEasemobUsersFromBaseUsers;
