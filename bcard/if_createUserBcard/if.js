var MEAP = require("meap");
var gm = require('gm').subClass({
    imageMagick : true
});
var uuid = require("node-uuid");
var fs = require("fs");
var path = require("path");
var async = require("async");
var mongoose = require("mongoose");
var bcardSchema = require("../bcardSchema.js");
var bcardUtil = require("../util.js");

/**
 * 根据模版生成名片，其中商业公司名片需要单独生成
 * @author donghua.wang
 * @date 2016年1月19日 13:30
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("bcard.createUserBcard start");
    Response.setHeader("Content-Type", "text/json;charset=utf-8");
    var arg = JSON.parse(Param.body.toString());
    var templateId = arg.templateId;
    var templateEnName = null;
    var bcardTemplate = null;
    var bcardOrder = null;
    var msg = "";
    try {
        var erweimaImagePath = null;
        var erweimaImageURL = null;
        var backgroundImagePath = null;
        var backgroundImageURL = null;
        var bcardPath = null;
        var bcardURL = null;
        var conn = mongoose.createConnection(global.mongodbURL);
        async.series([
        //查询名片模板信息
        function(cb) {
            var bcardTemplateModel = conn.model("bcard_template", bcardSchema.bcardTemplateSchema);
            bcardTemplateModel.findById(templateId, function(err, doc) {
                if (err || doc == null) {
                    msg = "查询名片模版信息失败";
                    cb(-1, null);
                } else {
                    bcardTemplate = doc;
                    templateEnName = doc.templateEnName;
                    cb(err, null);
                }
            });
        },
        //查询名片属性顺序数据
        function(cb) {
            var bcardOrderModel = conn.model("bcard_order", bcardSchema.bcardOrderSchema);
            bcardOrderModel.findOne({}, function(err, data) {
                bcardOrder = data;
                conn.close();
                cb(err, null);
            });
        },
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
             if (templateEnName == "five-template.png") {
                vCard.organization = "正大天晴药业集团股份有限公司";
            }
            if (arg.job.display == "1" && arg.job.value != "") {
                vCard.title = arg.job.value;
            }
            if (arg.email.display == "1" && arg.email.value != "") {
                vCard.email = arg.email.value;
            }
            var contactErweima = vCard.getFormattedString();
            var erweimaFileName = uuid.v1() + ".png";
            erweimaImageURL = global.nginxURL + "uploads/bcard/images/" + erweimaFileName;
            erweimaImagePath = "/opt/emm/uploads/bcard/images/" + erweimaFileName;
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
                    var gmImg = gm(erweimaImagePath);
                    gmImg.trim().write(erweimaImagePath, function(err) {
                        if (templateEnName == "second-template.png" || templateEnName == "third-template.png") {
                            var gmImg = gm("/opt/emm/uploads/bcard/" + backgroundFileNme);
                            gmImg.draw("image", "over", backgroundConfig.location.start, backgroundConfig.location.size, "\"" + erweimaImagePath + "\"");
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
                    })
                } else {
                    cb(err, null);
                }
            });
        },
        //动态生成名片
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
            //判断是否需要在正面生成二维码
            var qrCodeConfig = bcardTemplate.qrCodeConfig;
            if (qrCodeConfig.create == "1") {
                gmImg.draw("image", "over", qrCodeConfig.location, qrCodeConfig.size, "\"" + erweimaImagePath + "\"");
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
            //输出文件
            var action = arg.action;
            var newFilename = uuid.v1() + ".png";
            if (action == "view") {//预览名片
                newFilename = "view_" + newFilename;
            }
            bcardPath = "/opt/emm/uploads/bcard/images/" + newFilename;
            gmImg.write(bcardPath, function(err) {
                if (!err) {
                    bcardURL = global.nginxURL + "uploads/bcard/images/" + newFilename;
                }
                cb(err, null);
            });
        }], function(err, data) {
            if (!err) {
                if (arg.action == "view") {
					var fsstat = fs.statSync(bcardPath);
					var fileSize = fsstat.size;
					fileSize = fileSize/1024 + "kb";
                    Response.end(JSON.stringify({
                        "status" : "0",
                        "msg" : "生成预览信息成功",
                        "fileurl" : bcardURL,
                        "filepath" : bcardPath,
						"fileSize":fileSize,
                        "backgroundBcardURL" : backgroundImageURL,
                        "backgroundBcardPath" : backgroundImagePath
                    }));
                } else if (arg.action == "create") {//将数据保存到数据
                    var conn1 = mongoose.createConnection(global.mongodbURL);
                    var bcardUserModel = conn1.model("bcard_user", bcardSchema.bcardUserSchema);
                    var times = Date.now();
                    var uuidStr = uuid.v1();
                    var qrCodeURL = "";
                    if (templateEnName == "forth-template.png") {
                        qrCodeURL = global.nginxURL + "uploads/bcard/forth-qrcode.jpg"
                    }
                    if(templateEnName =="five-template.png"){//2016.6.22加渠道模板
                       qrCodeURL = global.nginxURL + "uploads/bcard/five-qrcode.jpg"  
                    } 
					var clientType = arg.clientType;
					if(!clientType){
						clientType = 'weixin';
					}
                    var bcardUserOjb = new bcardUserModel({
                        "bcardName" : arg.bcardName,
                        "userId" : arg.userId,
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
                        "bcardURL" : bcardURL,
                        "bcardPath" : bcardPath,
                        "bcardBackgroudURL" : backgroundImageURL,
                        "bcardBackgroudPath" : backgroundImagePath,
                        "contactErweimaURL" : erweimaImageURL,
                        "contactErweimaPath" : erweimaImagePath,
                        "qrCodeURL" : qrCodeURL,
                        "uuid" : uuidStr,
						"clientType":clientType,
                        "creatTime" : times,
                        "updateTime" : times
                    });
                    bcardUserOjb.save(function(err, doc) {
                        conn1.close();
                        if (!err) {
                            Response.end(JSON.stringify({
                                "status" : "0",
                                "msg" : "保存名片成功",
                                "uuid" : uuidStr,
                                "fileurl" : bcardURL,
                                "filepath" : bcardPath,
                                "backgroundPath" : backgroundImagePath,
                                "backgroundURL" : backgroundImageURL,
                                "contactErweimaURL" : erweimaImageURL,
                                "id" : doc._id
                            }));
                        } else {
                            Response.end(JSON.stringify({
                                "status" : "-1",
                                "msg" : "保存名片失败"
                            }));
                        }
                    });
                } else {
                    Response.end(JSON.stringify({
                        "status" : "-1",
                        "msg" : "参数传递错误"
                    }));
                }
            } else {
                Response.end(JSON.stringify({
                    "status" : "-1",
                    "msg" : msg == "" ? "生成模版信息失败" : msg
                }));
            }
        });
    } catch(e) {
        console.log("bcard.createUserBcard error", e);
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "建立名片失败"
        }));
    }
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

