/*打开窗口*/
    function open_new(name,url,anim){
        appcan.window.open(name,url,anim,0,0,'','','')
    }
    
/*通过id获取dom元素*/
    function $$(id){
        return document.getElementById(id);
    }
/*url获取参数*/
function zy_parse(){
    var params = {};
    var loc = String(document.location);
    if (loc.indexOf("?") > 0) 
        loc = loc.substr(loc.indexOf('?') + 1);
    else 
        loc = uexWindow.getUrlQuery();
    var pieces = loc.split('&');
    params.keys = [];
    for (var i = 0; i < pieces.length; i += 1) {
        var keyVal = pieces[i].split('=');
        params[keyVal[0]] = decodeURIComponent(keyVal[1]);
        params.keys.push(keyVal[0]);
    }
    return params;
}
/*长按事件*/
function longTouch(css,e,fun){
    var start_time = new Date().getTime();
    e.className += " "+css;
    var time = setTimeout(function(){
        e.className = e.className.replace(" "+css,'');
        fun(e);
    },1500)
    e.ontouchend = function(){
        var end_time = new Date().getTime();
        if(end_time-start_time<1000){
            eval(e.getAttribute("onclick"));
           // e.removeAttribute("onclick");
        }
        clearTimeout(time);
        e.className = e.className.replace(" "+css,'');
    }
}
/*加密解密*/
function jiami(str){
    var nstr = [];
    var s;
    var stri = str.slice(0).split("");
    while (stri.length ) {
       s = stri.shift();
       nstr.push( String( s.charCodeAt() ).split("").reverse().join("") );
    }
    return nstr.reverse().join('.');
}
function jiemi(str){
 var a=str.split("").reverse().join("").split(".");str="";
 for(var i in a){str+=String.fromCharCode(a[i])}
 return (str);
}