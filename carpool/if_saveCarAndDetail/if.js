var MEAP = require("meap");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sm = require("../carpoolSchema.js");

/**
 * 
 *司机-维护车辆信息，维护个人信息
  作者:xialin
  时间:2016-4-6
 */
function run(Param, Robot, Request, Response, IF)
{
    var arg = JSON.parse(Param.body.toString());
    
    var imageId = "";
    
    
    //默认图片地址
    var fileURL = global.nginxURL+"uploads/carpool/defaultCar.png";
    var fileURL2 = ""; //上传图片实际大小地址
    if(arg.carImg !=null && arg.carImg != ""){
        imageId = arg.carImg;
    } 
    if(arg.fileURL != null && arg.fileURL != ""){
        fileURL = arg.fileURL;
    }
    if(arg.fileURL2 != null && arg.fileURL2 != ""){
        fileURL2 = arg.fileURL2;
    }
    
    
    
    var db = mongoose.createConnection(global.mongodbURL);
    var CarpoolCarModel=db.model("carpoolcar",sm.CarpoolCarSchema);
    
    var CarpoolUserModel=db.model("carpoolUser",sm.CarpoolUserSchema);//用户信息
    
    var CarpoolCarEntity=new CarpoolCarModel({
        carOwnerId:arg.userId,
        carOwnerName:arg.userName,
        company:arg.company,
        carType:arg.carType,
        carSeat:arg.carSeat,
        carModel:arg.carModel,
        carColor:arg.carColor,
        carNumber:arg.carNumber,
        carImg:imageId,
        fileURL:fileURL,
        fileURL2:fileURL2,
        state:1,
        createdAt:new Date().getTime()
    });
    
    var CarpoolUserEntity =new CarpoolUserModel({
        userId:arg.userId,
        userName:arg.userName ,//姓名
       company:arg.company, //公司 
       userDept :arg.userDept, //部门
       userPhotoURL:arg.userPhotoURL,  //压缩照片地址
       photoURL2:arg.photoURL2, //原始照片地址
       
       phoneNumber:arg.phoneNumber, //电话号码
       driverYear:arg.driverYear, //驾龄 
       weixin: arg.weixin, //微信账户
       zhifubao:arg.zhifubao, //支付宝
       createdAt:new Date().getTime(),//建立日期时间
       updateTime:new Date().getTime()//最后修改日期时间
        
    });
    
    
    
    CarpoolCarEntity.save(function(err,doc){
        Response.setHeader("Content-type","text/json;charset=utf-8");
        
        if(!err){
            
            CarpoolUserEntity.save(function(err,data){
                db.close();
                if(!err){
                    Response.end(JSON.stringify(
                    {  status:0,
                       msgStatus:"S4000110",
                       msg:'保存成功'
                     }
                      ));
                }else{
                    Response.end(JSON.stringify(
                 {
                    status:-1,
                    msgStatus:"E4000118",
                    msg:'保存失败'
                }));
                }
            });
            
            
            
        }else{
            
            db.close();
            Response.end(JSON.stringify(
                {
                    status:-1,
                    msgStatus:"E4000118",
                    msg:'保存失败'
                }));
            
        }
    });
    
}

exports.Runner = run;


                                

    

