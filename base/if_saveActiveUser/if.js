var MEAP = require("meap");
var REDIS = require("meap_redis");
var mongoose = require("mongoose");
var async = require("async");
var baseSchema = require("../BaseSchema.js");
var util = require("../util.js");

var tokens = null;
var dateStr = null;
var userIds = null;
var Client = null;
function run(Param, Robot, Request, Response, IF) {
    tokens = "";
    var times = new Date().getTime() - 86400*1000;
    dateStr = util.getDateStrFromTimes(times,false);
    if(Param.params.date != null){
        dateStr = Param.params.date;
    }
    var headers = Request.headers;
    var host = headers.host;
    if (host.indexOf("localhost") == -1) {
        Response.end("not auth");
        return;
    }
    async.series([
    //查询前一天的活跃softToken
    function(cb) {
        Client = REDIS.createClient(6379, global.emmRedisHost);
        Client.on("ready", function() {
            Client.select(0,function(){
                scanRedis(0,cb);
            });
        });
    },
    //根据softToken查询用户id
    function(cb) {
        if(tokens.length == 0){
			Response.end("no active users");
			return;
		}
		tokens = tokens.substr(0,tokens.length - 1);
        var option = {
            CN:"Dsn=mysql-emm",
            sql:"select  distinct(username)as userId from TermInfo where softToken in (" + tokens + ") and username is not null"
        };
        MEAP.ODBC.Runner(option,function(err,data,cols){
            console.log("line 47----------->",data.length);
            userIds = data;
            cb(null,"");
        });
    }], function(err, data) {
           if(userIds != null && userIds.length > 0){
               saveActiveUsers(0,userIds);
           }
		   Response.end("save active user over");
    });

}

function scanRedis(i,cb) {
    i = i || 0;
        Client.SCAN(i, function(err, data) {
           if(data[0] != "0"){
               var arr = data[1];
               var pattern = "AU:ALL::DAILY:" + dateStr + ":" + global.appId;
               for(var j in arr){
                   var item = arr[j];
                   //AU:ALL::DAILY:2015-05-14:aaaah10013:f34f684b05cf999d5a6d174e80a1f04f
                   if(item.indexOf(pattern) != -1){
                       tokens += "'" + item.split(":")[6] + "'," ;
                   }
               }
               i = data[0];
               if(i != "0"){
                    scanRedis(i,cb);
               }else{
                    Client.quit();
					 cb(null,"");
               }
           }else{
                Client.quit();
                cb(null,"");
           }
        });
}

function saveActiveUsers(i,userIds){
    i = i||0;
    if(i < userIds.length){
		var db = mongoose.createConnection(global.mongodbURL);
		var activeUserModel = db.model("base_activeuser",baseSchema.BaseActiveUserSchema);
        var times = new Date().getTime();
        var activeUserObj = new activeUserModel({
            "userId":userIds[i].userId,
            "appId":global.appId,
            "activeDate":dateStr,
            "createTime":times
         });  
         activeUserObj.save(function(err){
			 db.close();
             i++;
             saveActiveUsers(i,userIds);
         });
    }
}

exports.Runner = run;

