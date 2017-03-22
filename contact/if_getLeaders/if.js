var MEAP = require("meap");
var mongoose = require("mongoose");
var async = require("async");
var contactSchema = require("../Contact.js");

function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-Type", "text/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var leaderIds = [];
    var leaderArr = [];

    var option = {
      agent:false,
        url : global.baseURL + "/zhrws/zhrwswf04",
        method : "post",
        Cookie : true,
        Body : arg
    };
    MEAP.AJAX.Runner(option, function(err, res, data) {
        var data = JSON.parse(data);
		console.log("aaaaaaaaaaaaaaaaaaa:"+JSON.stringify(data));
        if (!err && data.ES_PUBLIC.TYPE == 0) {
            var leaders = data.ET_SPINFO.item;
            for (var i in leaders) {
                var leader = leaders[i];
                leaderArr.push(leader);
                var userId = leader.ZZ_SPZ;
                leaderIds.push(userId);
            }
            var conn = mongoose.createConnection(global.mongodbURL);
            async.parallel([
            //查询领导备注
            function(cb) {

                var userRemarkModel = conn.model("contact_user_remark", contactSchema.ContactUserRemarkSchema);
                var userId = arg.IM_PERNR;
                userRemarkModel.find({
                    "userId" : userId,
                    "linkmanId" : {
                        "$in" : leaderIds
                    }
                }, {
                    "linkmanId" : 1,
                    "remark" : 1
                }, function(err, data) {
                    cb(err, data);
                });
            },
            //查询领导职位
            function(cb) {
                var userModel = conn.model("base_user", contactSchema.BaseUserSchema);
                userModel.find({
                    "PERNR" : {
                        "$in" : leaderIds
                    }
                }, function(err, data) {
                    cb(err, data);
                });
            }], function(err, data) {
                conn.close();
                if (err) {
                    Response.end(JSON.stringify({
                        "status" : "-1",
                        "msg" : "查询我的领导列表失败2"
                    }));
                } else {
                    var remarks = data[0];
                    var stells = data[1];
                    getStell(leaderArr, stells);
                    Response.end(JSON.stringify({
                        "status" : "0",
                        "leader" : leaderArr,
                        "remark" : remarks
                    }));
                }
            });
        } else {
            Response.end(JSON.stringify({
                "status" : "-1",
                "msg" : "查询我的领导列表失败1"
            }));
        }
    });
}

function getStell(leaderArr, stells) {
    for (var i in leaderArr) {
		var leader = leaderArr[i];
		var userId = leader.ZZ_SPZ;
		leader.userId = userId;
		for(var j in stells){
			var stell = stells[j];
			var PERNR = stell.PERNR;
			if(userId == PERNR){
				leader.STELL = stell.STELL;
				leader.STLTX = stell.STLTX;			
				leader.photoStatus = stell.photoStatus;
				leader.photoURL = stell.photoURL;
				leader.photoURL2 = stell.photoURL2;
				leader.photoUpdateTime = stell.photoUpdateTime;
				break;
			}
		}	
    }
}

exports.Runner = run;

