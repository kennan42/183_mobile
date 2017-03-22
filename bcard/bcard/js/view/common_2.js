var view = view || {};

//#view.url 1 添加URL参数------------------------------------>> view.url
view.url = {};
view.apiUrl="http://218.92.66.228/";

// #view.3 ajax通讯 --------------------------------------------------------------------------->> view.ajax
// #view.3.2 ajax通讯 --------------------------------------------->> view.ajax
view.AJAX_CONFIG_DEFAULT = {
      url: undefined,
     type: 'POST',
      // async:true,
     contentType: "application/json",
     dataType: 'json',
  //   dataType: 'jsonp',   //跨域获取
     jsonp: "cb",//服务端用于接收callback调用的function名的参数
    data:JSON.stringify({}),
    success : undefined,
    error : undefined,
    complete : undefined,

};

view.ajax = function(config) {
    var p = _.extend({}, view.AJAX_CONFIG_DEFAULT, config || {});
    
     if(!p.url){
        return ;
    }
    p.url = view.apiUrl + p.url;
    if(p.type=='get'&&p.data!=undefined){
      p.type='get';
    }
    console.log(p);
 
   // appcan.request.ajax(p);
  console.log(p.data);
    $.ajax(p);
}


