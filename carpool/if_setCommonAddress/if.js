var MEAP=require("meap");
var mongoose = require("mongoose");
var sm = require("../carpoolSchema.js");

/**
 * 
 * 设置 常用的出发地址和目的地址
 * 这里固定四个区域，根据公司常态来选
 * 通过数据库来配置信息
 * 
 * 
 */

function run(Param, Robot, Request, Response, IF)
{
    
    var arg = JSON.parse(Param.body.toString());
    var company =arg.company; //获取公司
    var address =arg.address;  //获取地址
    var addressCode =arg.addressCode;  //获取常用地址
    
    var db = mongoose.createConnection(global.mongodbURL);
    var addressModel = db.model("commonAddress", sm.CommonAddressSchema);
    
    var addressEntiy =new addressModel({
        company:company,
        address:address,
        addressCode:addressCode
        
    });
    
    addressEntiy.save(function(err, data){
        db.close();
        
        if(!err){ 
            Response.end(JSON.stringify({
                status:0,
                msgStatus:"",
                msg:"save成功"
            }));
             
            
        }else{
            Response.end(JSON.stringify({
                status:-1,
                msgStatus:"",
                msg:"save失败" 
                
            })); 
        }
    });
    
    
    
    
}

exports.Runner = run;


                                

    

