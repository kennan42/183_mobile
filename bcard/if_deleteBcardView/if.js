var MEAP = require("meap");
var fs = require("fs");

/**
 * 删除名片预览图
 * @author donghua.wang
 * @date 2015年12月9日 10:33
 * */
function run(Param, Robot, Request, Response, IF) {
    console.log("bcard.deleteBcardView start");
    Response.setHeader("Content-Type", "text/json;charset=utf-8");
    try {
        var arg = JSON.parse(Param.body.toString());
        var filepath = arg.filepath;
		var backgroupFilePath = arg.backgroupFilePath;
		Response.end(JSON.stringify({
            "status" : "0"
        }));
		if(filepath.indexOf("/opt/emm/uploads/bcard/images") > 0){
			fs.unlinkSync(filepath);
		}
		if(backgroupFilePath.indexOf("/opt/emm/uploads/bcard/images") > 0){
			fs.unlinkSync(backgroupFilePath);
		}
    } catch(e) {
        console.log("bcard.deleteBcardView error", e);
        Response.end(JSON.stringify({
            "status" : "0"
        }));
    }
}

exports.Runner = run;

