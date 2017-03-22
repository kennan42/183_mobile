var MEAP = require("meap");

var crypto = require("crypto");
var fs = require('fs');
function run(Param, Robot, Request, Response, IF) {
    //console.log(crypto.getHashes());
    // 打印支持的hash算法

    //var algs = [ 'md5','sha','sha1','sha256','sha512','RSA-SHA','RSA-SHA1','RSA-SHA256','RSA-SHA512'];
    //var algs = ['sha'];

    //doHash(algs);

    var algs = ['blowfish', 'aes-256-cbc', 'cast', 'des', 'des3', 'idea', 'rc2', 'rc4', 'seed'];
    var key = "abc";
    var filename = "book.txt";
    //"package.json";
   // algs.forEach(function(name) {
   //     cipherDecipherFile(filename, name, key);
   // })
   var encrypted="";
   var cip = crypto.createCipher('rc4', key);
   encrypted += cip.update('ch_m9S4K0fnDOy5zLOqn9nXj5CG', 'binary', 'hex');
                            
    encrypted += cip.final('hex');
    
   
   
    console.log(encrypted);

    //console.log(crypto.getCiphers());
    
     var decrypted = "";
    var decipher = crypto.createDecipher('rc4', key);
    decrypted += decipher.update(encrypted, 'hex', 'binary');
    decrypted += decipher.final('binary');
    console.log(decrypted);
    

}

//加密
function cipher(algorithm, key, buf, cb) {
    var encrypted = "";
    var cip = crypto.createCipher(algorithm, key);
    encrypted += cip.update(buf, 'binary', 'hex');
    encrypted += cip.final('hex');
    cb(encrypted);
}

//解密
function decipher(algorithm, key, encrypted, cb) {
    var decrypted = "";
    var decipher = crypto.createDecipher(algorithm, key);
    decrypted += decipher.update(encrypted, 'hex', 'binary');
    decrypted += decipher.final('binary');
    cb(decrypted);
}

function cipherDecipherFile(filename, algorithm, key) {
    fs.readFile(filename, "utf-8", function(err, data) {
        if (err)
            throw err;
        var s1 = new Date();
        cipher(algorithm, key, data, function(encrypted) {
            var s2 = new Date();
            console.log('cipher:' + algorithm + ',' + (s2 - s1) + 'ms');
            decipher(algorithm, key, encrypted, function(txt) {
                var s3 = new Date();
                console.log('decipher:' + algorithm + ',' + (s3 - s2) + 'ms');
                //
                console.log(txt);
            });
        });
    });
}

// hash算法
function hashAlgorithm(algorithm) {

    var s1 = new Date();
    var filename = "test.txt";
    var txt = fs.ReadStream(filename);

    var shasum = crypto.createHash(algorithm);

    txt.on('data', function(d) {

        shasum.update(d);
    });

    txt.on('end', function() {
        var d = shasum.digest('hex');
        var s2 = new Date();
        console.log(algorithm + " ," + (s2 - s1) + 'ms,' + d);
    });

}

function doHash(hashs) {
    hashs.forEach(function(name) {
        hashAlgorithm(name);
    })
}

exports.Runner = run;

