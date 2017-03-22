var mongoose = require("mongoose");
var baseSchema = require("../../base/BaseSchema.js");

var baseConfig = {
    getConfigByName : function(name,cb){
        var conn = mongoose.createConnection(global.mongodbURL);
        var BaseConfigModel = conn.model("base_config",baseSchema.baseConfigSchema);
        BaseConfigModel.findOne({"name":name}, function(err,data){
                conn.close();
                if(!err){
                    cb(null,data);
                }
                else{
                    cb(-1,data);
                }
        });        
    },
    
    saveConfigByName: function(paramMap, cb){
        var conn = mongoose.createConnection(global.mongodbURL);
        var BaseConfigModel = conn.model("base_config",baseSchema.baseConfigSchema);
        BaseConfigModel.update({"name":paramMap["name"]}, paramMap, function(err){
                conn.close();
                if(!err){
                    cb(null,"update token successfully");
                    console.log("update token successfully:" + JSON.stringify(paramMap["access_token"]));
                }
                else{
                    cb(err,"update token unsuccessfully");
                    console.log("update token unsuccessfully:" + err);
                }
                
        });        
    }
    
};
exports.getConfigByName = baseConfig.getConfigByName;
exports.saveConfigByName = baseConfig.saveConfigByName;
