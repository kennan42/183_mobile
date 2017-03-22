var MEAP = require("meap");
var async = require("async");
/**
 *查询我的收藏及默认收藏    取消
 * 作者：zrx
 * 时间:2017-2-16
 *
 */
var arg = null;
function run(Param, Robot, Request, Response, IF) {
    arg = JSON.parse(Param.body.toString());
    main(Response);

}

function main(Response) {

    async.parallel([getCollectList, getDefaultList], function(err, data) {
        Response.setHeader("Content-type", "text/json;charset=utf-8");
        if (!err) {
            var data1 = data[0].data;
            var data2 = data[1].data;
            console.log(data1);
            console.log(data2);
            //对比数据
            var alldata = data2;
            if(data2.length!=0){
                for(var i=0;i<data1.length;i++){
                    var floag = false;
                    for(var j=0;j<data2.length;j++){
                        if(data1[i].cid == data2[j].cid){
                            floag = true;
                        }
                    }
                    if(!floag){
                        alldata.push(data1[i]); 
                    }
                }
            }else{
                alldata = data1;
            }
             
            Response.end(JSON.stringify({
                "status": 0,
                "message": "Success",
                "data" : alldata
            }));
        } else {
            Response.end(JSON.stringify({
                "status" : "-1",
                "msg" : data
            }));

        }

    });
}


//获取我的收藏
function getCollectList(callback) {
    var option = {
        method : 'POST',
        url : global.baseURL + "/news/getCollectList",
        Body : {
            "userId" : arg.userId
        },
        Cookie : "false"
    };

    MEAP.AJAX.Runner(option, function(err, res, data) {
        if (!err) {
            var data = JSON.parse(data);
            if (data.status == 0) {

                callback(null, data);
            } else {
                callback(-1, "查询我的收藏失败");
            }

        } else {
            callback(-1, "查询我的收藏失败");
        }
    });
}
 

//获取IT服务的代办数量
function getDefaultList(callback) {
    var option = {
        method : 'POST',
        url : global.baseURL + "/news/getDefaultList",
        Body : {
            "userId" : arg.userId
        },
        Cookie : "false"
    };
    MEAP.AJAX.Runner(option, function(err, res, data) {
        if (!err) {
            var data = JSON.parse(data);
            if (data.status == 0) {

                callback(null, data);
            } else {
                callback(-1, "查询默认收藏失败");
            }
        } else {
            callback(-1, "查询默认收藏失败");
        }
    });

}

exports.Runner = run;
