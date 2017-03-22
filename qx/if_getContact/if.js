var MEAP = require("meap");
var async = require("async");
var mongoose = require("mongoose");
var qxSchema = require("../qxSchema.js");

/**
 * 查询企信通讯录
 * @author donghua.wang
 * @date  2015年9月24日 09:17
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("qx.getContact start");
    Response.setHeader("Content-Type", "application/json;charset=utf8");
    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    var pageNumber = arg.pageNumber;
    var pageSize = arg.pageSize;
    if (pageNumber == null) {
        pageNumber = 1;
    }
    if (pageSize == null) {
        pageSize = 10;
    }
    var skip = (pageNumber - 1) * pageSize;
    var conn = mongoose.createConnection(global.mongodbURL);
    var contactModel = conn.model("qx_contact", qxSchema.qxContactSchema);
    var groupModel = conn.model("qx_group",qxSchema.qxGroupSchema);
    contactModel.find({
        "userId" : userId,
        "status" : 1
    }).populate("group").sort({
        "createTime" : 1
    }).limit(pageSize).skip(skip)
      .exec(function(err,data){
          conn.close();
          console.log("qx.getContact end");
          Response.end(JSON.stringify({
              "status":"0",
              "msg":"查询成功",
              "data":data
          }));
      });
}

exports.Runner = run;

