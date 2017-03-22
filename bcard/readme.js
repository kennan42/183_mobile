
//生成二维码 
var fs = require('fs');
//var qr = require('qr-image');

//var qr_svg = qr.image('hello world', { type: 'svg' });
var qr_svg = qr.image('hello world');
qr_svg.pipe(fs.createWriteStream('/root/test/hello.png'));


//生成名片模版
gm('./demo.jpg')
.font("./STXINGKA.TTF", 50)//引用的字体
.drawText(250, 240, "王东华")
//500是x 330是y 100是icons的宽 30是icons的高  图片路径必须加引号 \"./icons.png\"
.draw("image", "Over" ,"450,330" ,"100,30" ,"\"./icons.png\"")                  
.write("./out3.jpg", function (err) {
   console.log(err);
});


//所有的图片保存在路径 /opt/emm/uploads/bcard下,对应的nginxURL为 http://ip:port/uploads/bcard/some.jpg
//如果是预览临时生成的图片，建议临时预览图名字已tmp_xxxxx的样式，需要定期清理