var mongoose = require("mongoose");
var schema = require("../Contact.js");
var baseUserDao = {
    getBaseUsersByPage:function(page,cb){
        /**
         * page={
         *     pageNumber:页码
         *     pageSize:每页大小,默认20
         *     
         * }
         */
        var pageNumber = page.pageNumber;
        var pageSize = page.pageSize || 20;
        var conn =  mongoose.createConnection(global.mongodbURL);
        var BaseUserModel = conn.model("base_user",schema.BaseUserSchema);
        var skip = pageSize*(pageNumber-1);
        BaseUserModel.find({}).skip(skip).limit(pageSize).exec(function(err,data){
            conn.close();
            if(!err){
                cb(0,data);
            }else{
                cb(-1,null)
            }
        });
    },
    
    countBaseUsers: function(cb){
        var conn =  mongoose.createConnection(global.mongodbURL);
        var BaseUserModel = conn.model("base_user",schema.BaseUserSchema);
        BaseUserModel.aggregate([ {$group:{_id:null,count:{$sum:1}}}],function(err,data){
            conn.close();
            if(!err){
                cb(0,data[0].count);
            }else{
                cb(-1,null);
            }
        });
    }
};

exports.getBaseUsersByPage = baseUserDao.getBaseUsersByPage;
exports.countBaseUsers = baseUserDao.countBaseUsers;
