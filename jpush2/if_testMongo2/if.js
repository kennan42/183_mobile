var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var baseSchema = require("../BasePushSchema.js");

function run(Param, Robot, Request, Response, IF) {

    var con = JSON.parse(Param.body.toString());
    console.log(1111);

    var db = mongoose.createConnection(global.mongodbURL);

    var messageModel = db.model("msgLog", baseSchema.msgLogSchema);

    var startTime = new Date().getTime();
    var endTime;
    
    var ulist = ["8000", "8111", "8222", "8333", "8444", "8555"];
    var result = [];
    for (var i = 0; i < ulist.length; i++) {

        result.push({
        "content" : "this is a test ",
        "uid" : ulist[i],
        "status" : 0,
        "msgType" : "bx"
    });
      
    }


    /*
     for (var i = 0; i < result.length; i++) {
     console.log(1111);

     var messageEntiy = new messageModel(result[i]);

     messageEntiy.save(function(err) {

     if (err) {

     console.log("淇濆瓨err");

     } else {
     console.log("淇濆瓨OK");
     }

     });

     };
     db.close();
     endTime = new Date().getTime();
     console.log("time----" + (endTime - startTime));
     */

    messageModel.collection.insert(result, {
        ordered : false
    }, function(err, data) {
       // console.info(err, " | ", data);
        if (err) {
            console.log("err");

        } else {
            console.log("ok:");
          //  console.log(JSON.stringify(data));
        }
        endTime = new Date().getTime();
        console.log("time----" + (endTime - startTime));
    });

    /*
     var  messageEntiy =new messageModel({

     msgType:"bx",
     content:"璐圭敤鎶ラ攢xxxxxxxxxxxxxxxxx",
     userList:[{"uid":"810000","status":0},{"uid":"8111","status":1},{"uid":"8222","status":1}],
     status:0

     });

     messageEntiy.save(function(err){

     if (err) {

     console.log("淇濆瓨澶辫触");

     }
     console.log("淇濆瓨OK");
     db.close();

     });*/

}

exports.Runner = run;
