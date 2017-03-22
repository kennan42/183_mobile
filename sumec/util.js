var util = {
    makeOdbcOptions : function(option){
        var sql = "";
        var sqlArr  = option.sql.split("?");
        for(var i in sqlArr){
            if(i==0){
                sql = sqlArr[i];
                continue;
            }
            if(typeof(option.param[i-1])=="string"){
                sql +=  "\"" + option.param[i-1] + "\"" + sqlArr[i];
                continue;
            }
            if(typeof(option.param[i-1]=="number")){
               sql +=  "" + option.param[i-1] + sqlArr[i];
               continue;
            }
        }
        var option_ = {CN:option.CN, sql:sql};
        return option_;
    },
    
    date2str : function (x, y) {
       var z = {
          y: x.getFullYear(),
          M: x.getMonth() + 1,
          d: x.getDate(),
          h: x.getHours(),
          m: x.getMinutes(),
          s: x.getSeconds()
       };
       return y.replace(/(y+|M+|d+|h+|m+|s+)/g, function(v) {
          return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-(v.length > 2 ? v.length : 2))
       });
    }    
}

exports.makeOdbcOptions = util.makeOdbcOptions;
exports.date2str = util.date2str;
