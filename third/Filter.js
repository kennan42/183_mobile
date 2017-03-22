function run(Param, Robot, Request, Response, IF, cb) {
    /**var headers = Request.headers;
    if (headers.invokeuser == null || headers.invokepass == null) {
       Response.end(JSON.stringify({
           "status" : "-1",
           "msg" : "认证失败"
        }));
        //cb(-1);
        return;
    }
    var invokeuser = headers.invokeuser;
    var invokepass = headers.invokepass;
    var username = new Buffer("cttq").toString("base64");//Y3R0cQ==
    var password = new Buffer("cttq-123").toString("base64");//Y3R0cS0xMjM=
    if (invokeuser != username || invokepass != password) {
        Response.end(JSON.stringify({
            "status" : "-1",
            "msg" : "认证失败"
        }));
       // cb(-1);
       return;
    }*/
    cb(0);
}

exports.Runner = run;
