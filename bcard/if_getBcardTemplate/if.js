var MEAP = require("meap");
var mongoose = require("mongoose");
var async = require("async");
var bcardSchema = require("../bcardSchema.js");

/**
 * 查询名片模版
 * @author donghua.wang
 * @date 2015年12月3日 16:03
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("bcard.getBcardTemplate start");
    Response.setHeader("Content-Type", "text/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
    var isinternal = arg. isinternal;
    var conn = mongoose.createConnection(global.mongodbURL);
    var bcardTemplateModel = conn.model("bcard_template", bcardSchema.bcardTemplateSchema);
    var bcardOrderModel = conn.model("bcard_order", bcardSchema.bcardOrderSchema);
    var condition = {"templateStatus" : 1};
    if(isinternal == "0"){//外部员工
        condition.open = "1";   
    }
    async.parallel([
    function(cb) {
        bcardTemplateModel.find(condition,{
            "templateEnName" : 1,
            "templateCnName" : 1,
            "templateURL" : 1,
            "templateBackgroundURL" : 1,
            "templateDemoURL" : 1
        }).sort({
            "templateOrder" : 1
        }).exec(function(err, data) {
            cb(err, data);
        });
    },
    function(cb) {
        bcardOrderModel.findOne({}, function(err, data) {
            cb(err, data);
        })
    }], function(err, data) {
        console.log("bcard.getBcardTemplate end");
        Response.end(JSON.stringify({
            "status" : "0",
            "data" : data[0],
            "order" : data[1]
        }));
    });

}

exports.Runner = run;

