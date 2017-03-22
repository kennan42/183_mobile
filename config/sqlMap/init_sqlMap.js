var xpath = require("xpath");
var dom = require("xmldom").DOMParser;
var fs = require("fs");

//var async = require("async");
var files = fs.readdirSync(__dirname);
var result = {};
files.forEach(function(file) {
    if(!file.startsWith("sqlMap")) return;
    var o = {};
    var xml = fs.readFileSync(__dirname +"/"+ file, "utf-8");
    var doc = new dom().parseFromString(xml);
    var namespace = xpath.select1("//sqlMap/@namespace", doc).value;
    //取sql
    var sqls = xpath.select("//sqlMap/sql", doc);
    for (var i in sqls) {
        var id = xpath.select1("./@id", sqls[i]).value;
        var sql = sqls[i].childNodes[0].nextSibling.data.trim().replace(/\s+/g, ' ');
        //var sql = xpath.select("./text()",sqls[i]).toString();
        o[id] = sql;
    }
    result[namespace] = o;
});
 console.log(result);

module.exports = result;
