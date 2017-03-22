var MEAP = require("meap");
var async = require("async");
var mongoose = require("mongoose");
var uuid = require("node-uuid");
var path = require("path");
var gm = require('gm').subClass({
    imageMagick : true
});
var fs = require("fs");
var bcardSchema = require("../bcardSchema.js");

/**
 * 修改用户名片信息
 * @author donghua.wang
 * @date 2015年12月17日 10:43
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("bcard.updateUserBcardStart");
    Response.setHeader("Content-Type", "text/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
    var bcardId = arg.bcardId;
    var templateId = arg.templateId;
    var templateEnName = null;
    var oldContactErweimaPath = "";
    //查询名片信息
    var conn = mongoose.createConnection(global.mongodbURL);
    var bcardUserModel = conn.model("bcard_user", bcardSchema.bcardUserSchema);
    var bcardTemplateModel = conn.model("bcard_template", bcardSchema.bcardTemplateSchema);
    var bcardOrderModel = conn.model("bcard_order", bcardSchema.bcardOrderSchema);
    async.parallel([
    //查询名片模版信息
    function(cb) {
        bcardTemplateModel.findById(templateId, function(err, doc) {
            cb(err, doc);
        });
    },
    //查询名片数据信息
    function(cb) {
        bcardUserModel.findById(bcardId, function(err, doc) {
            oldContactErweimaPath = doc.contactErweimaPath;
            cb(err, doc);
        });
    },
    //查询名片属性顺序信息
    function(cb) {
        bcardOrderModel.findOne({}, function(err, doc) {
            cb(err, doc);
        });
    }], function(err, data) {
        conn.close();
        if (err) {
            Response.end(JSON.stringify({
                "status" : "-1",
                "msg" : "查询名片信息失败"
            }));
        } else {
            var bcardTemplate = data[0];
            templateEnName = bcardTemplate.templateEnName;
            var userBcard = data[1];
            var bcardOrder = data[2];
            var newBcardPath = null;
            var newBcardURL = null;
            var contactErweimaURL = null;
            var contactErweimaPath = null;
            var backgroundImagePath = null;
            var backgroundImageURL = null;
            async.series([
            //生成名片二维码
            function(cb) {
                var backgroundConfig = bcardTemplate.backgroundConfig;
                var backgroundType = backgroundConfig.type;
                var backgroundFileNme = backgroundConfig.name;
                var vCard = require('vcards-js');
                vCard = vCard();
                vCard.firstName = arg.userName.value;
                vCard.middleName = '';
                vCard.lastName = '';
                if (arg.mobileNumber.display == "1" && arg.mobileNumber.value != "") {
                    vCard.cellPhone = arg.mobileNumber.value;
                }
                if (arg.company.display == "1" && arg.company.value != "") {
                    vCard.organization = arg.company.value;
                }
                if (templateEnName == "first-template.png") {
                    vCard.organization = "正大天晴药业集团股份有限公司";
                }
                if (templateEnName == "forth-template.png") {
                    vCard.organization = "连云港正大天晴医药有限公司";
                }
                if (arg.job.display == "1" && arg.job.value != "") {
                    vCard.title = arg.job.value;
                }
                if (arg.email.display == "1" && arg.email.value != "") {
                    vCard.email = arg.email.value;
                }
                var contactErweima = vCard.getFormattedString();
                var erweimaFileName = uuid.v1() + ".png";
                contactErweimaURL = global.nginxURL + "uploads/bcard/images/" + erweimaFileName;
                contactErweimaPath = "/opt/emm/uploads/bcard/images/" + erweimaFileName;
                var optionCreateErweima = {
                    "url" : global.masJavaWebURL + "/WriteErweimaServlet",
                    "method" : "POST",
                    "Enctype" : "application/x-www-form-urlencoded",
                    "Body" : {
                        "path" : "/opt/emm/uploads/bcard/images/",
                        "content" : contactErweima,
                        "filename" : erweimaFileName,
                        "width" : 185,
                        "height" : 185
                    }
                };
                MEAP.AJAX.Runner(optionCreateErweima, function(err, res, data) {
                    if (!err) {//将生成的二维码写到名片背面模版
                        var gmImg = gm(contactErweimaPath);
                        gmImg.trim().write(contactErweimaPath, function(err) {
                            if (templateEnName == "second-template.png" || templateEnName == "third-template.png") {
                                var gmImg = gm("/opt/emm/uploads/bcard/" + backgroundFileNme);
                                gmImg.draw("image", "over", backgroundConfig.location.start, backgroundConfig.location.size, "\"" + contactErweimaPath + "\"");
                                var outputFileName = uuid.v1() + ".png";
                                backgroundImagePath = "/opt/emm/uploads/bcard/images/" + outputFileName;
                                backgroundImageURL = global.nginxURL + "uploads/bcard/images/" + outputFileName;
                                gmImg.write(backgroundImagePath, function(err) {
                                    cb(err, null);
                                });
                            } else {
                                backgroundImagePath = "";
                                backgroundImageURL = global.nginxURL + "uploads/bcard/" + backgroundFileNme;
                                cb(err, null);
                            }
                        });

                    } else {
                        cb(err, null);
                    }
                });
            }, //动态生成名片
            function(cb) {
                var templatePath = bcardTemplate.templatePath;
                //名片属性配置信息
                var itemConfig = bcardTemplate.itemConfig;
                var templateEnName = bcardTemplate.templateEnName;
                //初始化位置信息
                var startLocationConfig = bcardTemplate.startLocationConfig;
                var startLocationX = startLocationConfig.startLocationX;
                var startLocationY = startLocationConfig.startLocationY;
                var incrementLocationX = startLocationConfig.incrementLocationX;
                var incrementLocationY = startLocationConfig.incrementLocationY;
                var companyConfig = bcardTemplate.companyConfig;
                if (companyConfig.inputFormat == "background") {
                    arg.company.display = "0";
                }
                //可选项最大显示数量
                var selectedMaxDisplayCount = bcardTemplate.selectedMaxDisplayCount;
                var selectedDisplayCount = 0;
                //加载名片模版
                var gmImg = gm(templatePath);
                var userName = null;
                var userNameLength = 0;
                var jobValueLoc = null;
                var requiredItems = bcardTemplate.requiredItems;
                var align = bcardTemplate.align;
                var fontConfig = bcardTemplate.fontConfig;
                var order = bcardOrder.order;
                var selectedItems = bcardTemplate.selectedItems;
                //如果是第一张模版，那么应该判断userName的长度度，如果长度为4，则需要将岗位右移一定像素
                if (templateEnName == "first-template.png") {
                    userName = arg.userName.value;
                    userNameLength = userName.length;
                }
                for (var i = 0; i < order.length; i++) {
                    var item = order[i];
                    var text = getText(item, selectedItems);
                    var rs = isRequired(item, requiredItems);
                    if (rs != null || (arg[item].display == "1" && arg[item].value != "")) {
                        var currentValue = arg[item].value;
                        if (item == "userName" && currentValue.length == 2) {
                            var tmpArr = currentValue.split("");
                            currentValue = tmpArr[0] + "  " + tmpArr[1];
                        }
                        //必输项
                        if (rs) {
                            //绝对定位
                            if (rs.locateType == "absolute") {
                                var currentLocationX = rs.valueLocationX;
                                if (userNameLength == 4 && templateEnName == "first-template.png" && item == "job") {
                                    currentLocationX = currentLocationX + 50;
                                }
                                gmImg.font(rs.fontFamily, rs.fontSize);
                                gmImg.drawText(currentLocationX, rs.valueLocationY, currentValue, align);
                            } else {//相对定位
                                gmImg.font(fontConfig.fontFamily, fontConfig.fontSize);
                                gmImg.drawText(startLocationX, startLocationY, rs.text + currentValue, align);
                                startLocationY += incrementLocationY;
                            }
                        } else {//非必输项
                            gmImg.font(fontConfig.fontFamily, fontConfig.fontSize);
                            gmImg.drawText(startLocationX, startLocationY, text + currentValue, align);
                            startLocationY += incrementLocationY;
                            selectedDisplayCount++;
                        }
                    }
                    if (selectedDisplayCount == selectedMaxDisplayCount) {
                        break;
                    }
                }
                //判断是否需要在正面生成二维码
                var qrCodeConfig = bcardTemplate.qrCodeConfig;
                if (qrCodeConfig.create == "1") {
                    gmImg.draw("image", "over", qrCodeConfig.location, qrCodeConfig.size, "\"" + contactErweimaPath + "\"");
                }
                //输出文件
                var action = arg.action;
                var newFilename = uuid.v1() + ".png";
                if (action == "view") {//预览名片
                    newFilename = "view_" + newFilename;
                }
                newBcardPath = "/opt/emm/uploads/bcard/images/" + newFilename;
                gmImg.write(newBcardPath, function(err) {
                    if (!err) {
                        newBcardURL = global.nginxURL + "uploads/bcard/images/" + newFilename;
                    }
                    cb(err, null);
                });
            }], function(err, data) {
                if (!err) {
                    var conn1 = mongoose.createConnection(global.mongodbURL);
                    var bcardUserModel = conn1.model("bcard_user", bcardSchema.bcardUserSchema);
                    var times = Date.now();
                    bcardUserModel.update({
                        "_id" : bcardId
                    }, {
                        "bcardName" : arg.bcardName,
                        "userName" : arg.userName,
                        "job" : arg.job,
                        "dept" : arg.dept,
                        "company" : arg.company,
                        "enName" : arg.enName,
                        "mobileNumber" : arg.mobileNumber,
                        "call" : arg.call,
                        "companyAddress" : arg.companyAddress,
                        "email" : arg.email,
                        "QQ" : arg.QQ,
                        "weixin" : arg.weixin,
                        "companyEmail" : arg.companyEmail,
                        "companyPage" : arg.companyPage,
                        "fax" : arg.fax,
                        "postcode" : arg.postcode,
                        "servicePhone" : arg.servicePhone,
                        "templateId" : arg.templateId,
                        "bcardURL" : newBcardURL,
                        "bcardPath" : newBcardPath,
                        "bcardBackgroudURL" : backgroundImageURL,
                        "bcardBackgroudPath" : backgroundImagePath,
                        "contactErweimaURL" : contactErweimaURL,
                        "contactErweimaPath" : contactErweimaPath,
                        "updateTime" : times
                    }, function(err) {
                        conn1.close();
                        if (!err) {
                            Response.end(JSON.stringify({
                                "status" : "0",
                                "msg" : "更新名片成功",
                                "fileurl" : newBcardURL,
                                "backgroundURL" : backgroundImageURL,
                                "contactErweimaURL" : contactErweimaURL,
                                "uuid" : userBcard.uuid
                            }));
                            //删除旧名片
                            fs.unlink(userBcard.bcardPath, function(err) {
                                console.log("unlink user old bcard", err);
                            });
                            fs.unlink(userBcard.contactErweimaPath, function(err) {
                                console.log("unlink user old vcard", err);
                            });
                        } else {
                            Response.end(JSON.stringify({
                                "status" : "-1",
                                "msg" : "更新名片失败"
                            }));
                        }
                    });
                } else {
                    Response.end(JSON.stringify({
                        "status" : "-1",
                        "msg" : "更新名片失败"
                    }));
                }
            });
        }
    });
}

/**
 *判断key是否为必须输入选项
 */
function isRequired(key, arr) {
    var rs = null;
    for (var i in arr) {
        if (key == arr[i].key) {
            rs = arr[i];
            break;
        }
    }
    return rs;
}

//得到可选项的text属性
function getText(key, selectedItems) {
    var text = "";
    for (var i = 0; i < selectedItems.length; i++) {
        var item = selectedItems[i];
        if (item.key == key) {
            text = item.text;
            break;
        }
    }
    return text;
}

exports.Runner = run;

