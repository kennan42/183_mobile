var REDIS = require("meap_redis");

var uexRedisUtils = {
    HGET: function(_hash, _key){
        try {
            var Client = REDIS.createClient(global.redisPort, global.redisHost);
            Client.on("ready", function(){
                Client.select(3, function(){
                    Client.HGET(_hash, _key, function(err, obj){
                        if (!err && obj) {
                            return obj;
                        }
                        else {
                            return null;
                        }
                        Client.quit();
                    });
                });
            });
        } 
        catch (e) {
            return "error";
        }
    },
	
    HSET: function(_hash,_key, _value){
        try {
            var Client = REDIS.createClient(global.redisPort, global.redisHost);
            Client.on("ready", function(){
                Client.select(3, function(){
                    Client.HSET(_hash, _key, _value, function(err, obj){
                        if (!err && obj) {
                            return true;
                        }
                        else {
                            return false;
                        }
                        Client.quit();
                    });
                });
            });
        } 
        catch (e) {
            return "error";
        }
    }
}
exports.redisUtils =uexRedisUtils;

