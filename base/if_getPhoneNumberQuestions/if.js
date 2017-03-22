var MEAP = require("meap");
var REDIS = require("meap_redis");
var util = require("../util");

function run(Param, Robot, Request, Response, IF) {
    Response.setHeader("Content-type", "text/json;charset=utf-8");

    var arg = JSON.parse(Param.body.toString());
    var userId = arg.userId;
    if (!(userId)) {
        Response.end(JSON.stringify({
            status: 1,
            msg: "参数错误"
        }));
        return;
    }

    var key = 'phoneNumberLock:' + userId;

    var redisCli = REDIS.createClient(global.redisPort, global.redisHost);
    redisCli.on("ready", function () {  // 准备
        redisCli.select(10, function () {  // 选择10号库
            redisCli.get(key, function (err, data) {  // 获取是否被锁
                if (err) {
                    Response.end(JSON.stringify({
                        status: 1,
                        msg: "题目获取失败"
                    }));

                    redisCli.quit();
                } else if (data != null) { // 如果被锁获取不到题目
                    Response.end(JSON.stringify({
                        status: 3,
                        msg: "账号被锁无法获取题目"
                    }));

                    redisCli.quit();
                } else {
                    key = 'phoneNumberChange:' + userId;
                   // var ttl = 3600;
                    var ttl =120;
                    var value = {};
                    redisCli.get(key, function (err, data) {  // 获取是否处于一个重置任务中
                        if (err) {
                            Response.end(JSON.stringify({
                                status: 1,
                                msg: "题目获取失败"
                            }));

                            redisCli.quit();
                        } else if (data != null) { // 如果处于一个重置任务中获取不到题目
                            Response.end(JSON.stringify({
                                status: 2,
                                msg: "已处于一个重置任务中"
                            }));

                            redisCli.quit();
                        } else { // 如果未处于一个重置任务中则获取题目
                            getQuestion(Param, Robot, Response, userId, function () {
                                redisCli.SETEX(key, ttl, JSON.stringify(value), function (err) {
                                    redisCli.quit();
                                });
                            });
                        }
                    });
                }
            });
        });
    });


}

/**
 *
 * @param Param
 * @param Robot
 * @param Response
 * @param userId
 * @param cb
 */
function getQuestion(Param, Robot, Response, userId, cb) {
    zhrtxws11(Param, Robot, userId, function (err, data) {
        if (err != null || data == null) {
            Response.end(JSON.stringify({
                status: 1,
                msg: err
            }));
            return;
        }
        if (data.ES_PUBLIC.CODE != 'S') {
            Response.end(JSON.stringify({
                status: 4,
                msg: data.ES_PUBLIC.MESSAGE
            }));
            functionLog(Robot,userId,"incompleteInformation",function(){});
            return;
        }
        // 身份证
        var idNum = data.ET_ICNUM.item[0].ICNUM;

        // 银行卡
        var banks = {};
        for (var i in data.ET_BANKNR.item) {
            var obj = data.ET_BANKNR.item[i];
            if (!banks.BNKSA || banks.BNKSA > obj.BNKSA) {
                banks = {
                    BNKSA: obj.BNKSA,
                    STEXT: obj.STEXT,
                    BANKA: obj.BANKA,
                    ZBANKNR: obj.ZBANKNR
                };
            }
        }

        // 入司时间
        var ET_RSSJ = createOptions(data.ET_RSSJ.item, '请选择您的入司日期|rssj', "RTYPE", "DARDT", 5, 3);

        // 检查四个问题是否可用
        var questionList = [];
        questionList = checkeIfAble2Use(questionList, data.ET_BYYX.item, "请选择您的毕业院校|college", "RTYPE", "INSTI");
        questionList = checkeIfAble2Use(questionList, data.ET_FADDR.item, "请选择您的家庭住址|familyAddr", "RTYPE", "ZADDR");
        questionList = checkeIfAble2Use(questionList, data.ET_FAMILY.item, "请选择您的家庭成员电话号码|familyPhone", "RTYPE", "ZZ_LXTEL");
        questionList = checkeIfAble2Use(questionList, data.ET_FAMILY.item, "请选择您的家庭成员|familyMem", "RTYPE", "FANAM");

        // 如果可用问题少于2个,说明人事信息不完整
        if (questionList.length < 2) {
            Response.end(JSON.stringify({
                status: 4,
                msg: "人员信息不完善"
            }));
            functionLog(Robot,userId,"incompleteInformation",function(){});
            return;
        }

        //随机两个问题
        var questions = [];
        var hasRandom = {};
        for (var i = 0; i < 2; i++) {
            var index = -1;
            while (true) {
                index = parseInt(Math.random() * questionList.length);
                if (hasRandom["cttq" + index] == null) {
                    hasRandom["cttq" + index] = index;
                    break;
                }
            }
            var title = questionList[index].pop();
            questions.push(createOptions1(questionList[index], title, 5, 3));

            //switch (index) {
            //    case 0:
            //        questions.push(createOptions(data.ET_BYYX.item, '请选择您的毕业院校', "RTYPE", "INSTI", 5, 3));
            //        break;
            //    case 1:
            //        questions.push(createOptions(data.ET_FADDR.item, '请选择您的家庭住址', "RTYPE", "ZADDR", 5, 3));
            //        break;
            //    case 2:
            //        questions.push(createOptions(data.ET_FAMILY.item, '请选择您的家庭成员电话号码', "RTYPE", "ZZ_LXTEL", 5, 3));
            //        break;
            //    case 3:
            //        questions.push(createOptions(data.ET_FAMILY.item, '请选择您的家庭成员', "RTYPE", "FANAM", 5, 3));
            //        break;
            //}

        }

        var result = [
            [
                "身份证|idcard",
                idNum
            ],
            [
                banks.BANKA + " " + banks.STEXT + "|bankCard",
                banks.ZBANKNR
            ],
            [  // 入司时间
                ET_RSSJ.title,
                ET_RSSJ.options[0],
                ET_RSSJ.options[1],
                ET_RSSJ.options[2]
            ],
            [
                questions[0].title,
                questions[0].options[0],
                questions[0].options[1],
                questions[0].options[2]

            ],
            [
                questions[1].title,
                questions[1].options[0],
                questions[1].options[1],
                questions[1].options[2]

            ]
        ];
        Response.end(JSON.stringify({
            status: 0,
            msg: "获取成功",
            data: result
        }));

        if (typeof cb == 'function') {
            cb();
        }

    });
}

/**
 *
 * @param Param
 * @param Robot
 * @param userId
 * @param cb
 */
function zhrtxws11(Param, Robot, userId, cb) {
    var option = {
        method: "POST",
        url: global.baseURL + "/zhrtxws/zhrtxws11",
        Cookie: "true",
        Enctype: "application/json",
        Body: JSON.stringify({
            "IM_PERNR": userId
        })
    };
    MEAP.AJAX.Runner(option, function (err, res, data) {
        if (err != null || data == null) {
            cb(err, {});
            return
        }
        cb(err, JSON.parse(data));
    }, Robot);
}

/**
 * 生成n组选项,每组m个选项
 * @param data [{key:xxx,...},..] 数据,数组,每个元素为一个对象
 * @param title 标题
 * @param answerKey 用于取data对象中是否为正确答案的key
 * @param key 用于取data对象中对应值的key
 * @param m 每组选项个数
 * @param n 组数
 * @returns [{answer:0,options:["",..]},...]
 */
function createOptions(data, title, answerKey, key, m, n) {
    var result = {};
    result.title = title;
    var choicesArr = [];
    var answer = "";
    for (var i in data) {
        var obj = data[i];
        if (obj[answerKey] != 'A') {
            choicesArr.push(obj[key].toString());
        } else {
            answer = obj[key].toString();
        }
    }
    var optionResult = [];
    for (var i = 0; i < n; i++) {

        var copyChoices = choicesArr.slice();
        // 随出m - 1 个选项,存于 tempChoices 中
        var tempChoices = [];
        for (var j = 0; j < m - 1; j++) {
            var index = parseInt(Math.random() * copyChoices.length);
            tempChoices.push(copyChoices.splice(index, 1)[0]);
        }
        // 将正确答案放到 copyChoices 中
        var index = parseInt(Math.random() * m);
        tempChoices.splice(index, 0, answer);

        optionResult.push({
            answer: index,
            options: tempChoices
        });
    }

    result.options = optionResult;
    return result;
}

/**
 * 生成n组选项,每组m个选项
 *
 * @param data [{answer:xxx,value:xxx},..] 数据,数组,每个元素为一个对象
 * @param title 标题
 * @param m 每组选项个数
 * @param n 组数
 * @returns {{}}
 */
function createOptions1(data, title, m, n) {
    var result = {};
    result.title = title;
    var choicesArr = [];
    var answer = "";
    for (var i in data) {
        var obj = data[i];
        if (obj.answer != 'A') {
            choicesArr.push(obj.value.toString());
        } else {
            answer = obj.value.toString();
        }
    }
    var optionResult = [];
    for (var i = 0; i < n; i++) {

        var copyChoices = choicesArr.slice();
        // 随出m - 1 个选项,存于 tempChoices 中
        var tempChoices = [];
        for (var j = 0; j < m - 1; j++) {
            var index = parseInt(Math.random() * copyChoices.length);
            tempChoices.push(copyChoices.splice(index, 1)[0]);
        }
        // 将正确答案放到 copyChoices 中
        var index = parseInt(Math.random() * m);
        tempChoices.splice(index, 0, answer);

        optionResult.push({
            answer: index,
            options: tempChoices
        });
    }

    result.options = optionResult;
    return result;
}

/**
 *
 * @param questionList
 * @param data
 * @param title
 * @param answerKey
 * @param key
 * @returns {*}
 */
function checkeIfAble2Use(questionList, data, title, answerKey, key) {
    var ifAble2Use = true;
    var resultArr = [];
    var hasCorrectAnswer = false;
    for (var i in data) {
        var obj = data[i];
        var tempStr = obj[key];
        // 答案不为{} '' null undefined 即可用
        if (typeof tempStr === 'object') {
            if (util.isEmptyObject(tempStr)) {
                tempStr = '';
            } else {
                tempStr = JSON.stringify(tempStr);
            }
        } else if (tempStr == null) {
            tempStr = '';
        } else {
            tempStr += '';
        }

        // 判断答案是否合法
        if (tempStr.length < 1) {
            ifAble2Use = false;
            break;
        }
        // 判断是否存在答案
        if (obj[answerKey] == 'A') {
            hasCorrectAnswer = true;
        }

        // 将答案以{anwer:xxx,value:xxx}存入数组
        var tempObj = {};
        tempObj.answer = obj[answerKey];
        tempObj.value = obj[key];
        resultArr.push(tempObj);
    }
    // 当所有答案可用并且存在正确答案时才将该题存入题目列表
    if (ifAble2Use && hasCorrectAnswer) {
        // 将标题存在数组的最后一位,以便后续获取标题
        resultArr.push(title);
        questionList.push(resultArr);
    }
    return questionList;
}

/**
 * 功能日志
 *
 * @param Robot
 * @param userId
 * @param subModule
 * @param cb
 */
function functionLog(Robot, userId, subModule, cb) {
    var option = {
        method: "POST",
        url: global.baseURL + "/app/addAppFuncUseLog",
        Cookie: "true",
        Enctype: "application/json",
        Body: JSON.stringify({
            userId: userId,
            module: "changePhoneNum",
            subModule: subModule
        })
    };
    MEAP.AJAX.Runner(option, function (err, res, data) {
        if (err != null || data == null) {
            cb(err, {});
            return
        }
        cb(err, JSON.parse(data));
    }, Robot);
}

exports.Runner = run;
