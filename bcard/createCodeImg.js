var fs = require("fs");
//var qr = require("qr-image");
var args = process.argv;
var uuid = args[2];
var imagePath = args[3];
var buf = qr.imageSync(uuid);
fs.writeFileSync(imagePath, buf); 
