function getEnCnCount(str){
    var enCount = 0;
    str.split("").forEach(function(char){
        char.charCodeAt(0)<128?enCount++:0;
    });
    var rs = {"cnCount":str.length -enCount,"enCount":enCount};
    return rs;
}

exports.getEnCnCount=getEnCnCount;