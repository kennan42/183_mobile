var mongoose = require("mongoose");
var Schema = mongoose.Schema;


//个人信息表
var  CarpoolUserSchema =new Schema({
	   userId:String, //用户工号
	   userName:String ,//姓名
	   company:String, //公司 
	   userDept :String, //部门
	   photoStatus:Number  ,//头像状态   0:正常  1：其他
	   userPhotoURL:String,  //压缩照片地址
	   photoURL2:String, //原始照片地址
	   
	   phoneNumber:String, //电话号码
	   driverYear:String, //驾龄 
	   weixin: String, //微信账户
	   
	   zhifubao:String, //支付宝
	   createdAt:Number,//建立日期时间
       updateTime:Number//最后修改日期时间
	   

	});

  



//拼车行程
var CarpoolTralvelSchema = new Schema({
    car:{
        type:Schema.Types.ObjectId,
        ref:"carpoolCar"
    },//车辆信息
    travel:{
        type:Schema.Types.ObjectId,
        ref:"carpoolTralvel"
    },//搭车人引用的开车人发起的CarpoolTralvel id
	
	userId:String, //用户工号	
    userName:String,//用户名字
    userType:Number,//1:拼车司机;2:拼车乘客   3.乘客发布（伪司机）  4.乘客变成约车成功发起人
	company:String , //所属公司字段
	carpoolType :Number,  //1:拼车记录   2.约车记录

    setUserNumber:Number,   //设定达到多少人发布
	setCloseTime:Number,   //约车截止时间
	   

    startProvince:String,//出发省份
    startCityCode:String,//出发城市代码
    startCity:String,//出发城市
    startAddress:String,//出发地点
    arriveProvince:String,//到达省份
    arriveCityCode:String,//达到城市代码
    arriveCity:String,//达到城市
    arriveAddress:String,//到达地点
    startDate:Number,//出发日期时间
	startDateHour:Number, //出发时间段
	startDateString:String, //出发时间字符串
	
    travelSerialNumber:String,//行程流水号(8位数字，递增)
   
    seatCount:Number,//提供座位数
    bookedSeatCount:Number,//已预定座位数
    seatState:Number,//0 未满；1已满；
   
    state:Number,//0:正常     1:被踢     2:取消行程     3取消预约
    
    createdAt:Number,//建立日期时间
    updateTime:Number,//最后修改日期时间
    createUser:String,//创建人
    remark:String//备注
    
});





//汽车
var CarpoolCarSchema = new Schema({
    carOwnerId:String,//车主id(工号)
    carOwnerName:String,//车主姓名
	company:String, //公司编码
    carType:String,//车型 suv  房车
    carSeat:Number,//座位数
    carModel:String,//品牌 bmw
    carColor:String,//颜色id
    carNumber:String,//车牌
    carImg:{
        type:Schema.Types.ObjectId,
        ref:"carpoolAttachment"
    },//图片
    fileURL:String,//图片默认url
    fileURL2:String, //图片原始大小地址
    state:Number,//1:正常    2:删除
    createdAt:Number,//建立日期时间
    updateTime:Number//最后修改日期时间
});


//附件信息
var CarpoolAttachmentSchema = new Schema({
    userId:String,//所有人
    fileName:String,//文件名
	company:String, //公司编码
    orinalFileName:String,//原始文件名
    fileSize:Number,//文件大小
    filePath:String,//文件路径,
    fileURL:String,//压缩后小尺寸文件网络路径
    filePath2:String,//压缩后原始尺寸文件网络路径
    createdAt:Number//建立日期时间
});

//信誉
var CarpoolCreditSchema = new Schema({
    userId:String,//用户id
    driveYear:Number,//驾龄
    credit1:Number,//开车人好评数
    credit2:Number,//乘车人好评数
    createdAt:Number//建立日期时间
});

//评价记录
var CarpoolEvaluateSchema = new Schema({
    userId:String,//评价人id
    userName:String,//评价人姓名
    evaluaterType:Number, //评价人类型  1开车人，2乘车人
    userId2:String,//被评价id
    userName2:String,//被评价人姓名
    travel:{
        type:Schema.Types.ObjectId,
        ref:"carpoolTravel"
    },//搭车人引用的开车人发起的CarpoolTralvel id
    createdAt:Number//建立日期时间
});

//踢人记录（司机）
var CarpoolRejectSchema = new Schema({
    userId:String,//踢人id
    userName:String,//踢人姓名
    rejectedUserId:String,//被踢人id
    rejectedUserName:String,//被踢人姓名
	company:String, //公司编码
    travle:{
        type:Schema.Types.ObjectId,
        ref:"carpoolTralvel"
    },//搭车人引用的开车人发起的CarpoolTralvel id
    reason:String,//踢人理由
    createdAt:Number//建立日期时间
}); 

//取消行程记录
var CarpoolCancelTravelSchema = new Schema({
    travel:{
        type:Schema.Types.ObjectId,
        ref:"carpoolTralvel"
    },
    userId:String,
    userName:String,
	company:String, //公司编码
    type:Number,//1司机取消;2乘客取消,3 :约车取消
    reason:String,
    createdAt:Number
    
});

//拼车声明
var CarpoolDeclareSchema = new Schema({
    content:String,//声明内容
    createAt:Number//创建时间
});



//行程次数
var CarpoolTravelCountSchema = new Schema({
    userId:String,//用户Id
    count1:String,//作为开车人的行程次数
    count2:String//作为搭车人的行程次数
});

var CarpoolSeriaNumberSchema = new Schema({
    seriaNumber:Number
})

//推送消息schema
var BasePushMessageSchema = new Schema({
    appId:String,//应用id
    userId:String,//用户id
    badgeNum:Number//未读消息数
});

var CarpoolAutoPublishTravelSchema = new Schema({
    car:{
        type:Schema.Types.ObjectId,
        ref:"carpoolCar"
    },//车辆信息
    userId:String,//用户id
    userName:String,//用户名字
    startProvince:String,//出发省份
    startCityCode:String,//出发城市代码
    startCity:String,//出发城市
    startAddress:String,//出发地点
    arriveProvince:String,//到达省份
    arriveCityCode:String,//达到城市代码
    arriveCity:String,//达到城市
    arriveAddress:String,//到达地点
    startTime:String,//出发日期时间 HH:mm
    seatCount:Number,//提供座位数
    filter:[],//要求 
    frequency:[],//发布频率
    addedUser:[],//已经乘车人
    isScaned:Number,//是否已经扫描过该记录   1是  0否，只有在第一次扫描到该记录时，才会在自动发布行程时添加乘客
    status:Number,//状态   1正常  0取消
    createdAt:Number,//建立日期时间
    updateTime:Number,//最后修改日期时间
    remark:String  //备注
});



var CitySchema=new Schema({
	
	ZID    :String,  //城市编码
    ZNANM  :String,  //城市名称
    ZPINYIN:String,  //拼音
    ZSUOXIE:String,  //拼音简写
    ZCSJB  :String,  //省内等级
    ZPRID  :String,  //省代码
    ZPRNM  :String,  //省名称
    ZLEVL  :String,
    ZMDAT  :String,    //年月日
    ZMTIM  :String,    //时分秒
   ZVERSION:String, //版本
   syncTime:String  //更新时间
	
	
});


//获取常用出发地和目的地
var  CommonAddressSchema =new Schema({
	  address:String , //地址
	  company:String ,  //公司
	  addressCode: String  //地址编码
	
});



//拼车 -新闻图片 
var CarpoolPictureSchema =new Schema({
     userId:String,//上传人
     fileName:String,//文件名
     newFileName:String,//新文件名
     fileSize:Number,//文件大小
     filePath:String,//文件路径,
     newFileURL :String, //压缩后 图片地址 
     newFileURL2 :String, //未压缩图片地址
     tag:Number ,//是否在轮播图中展示  0表示不展示  1：展示
     order:Number, //排序的顺序
     status:Number, //是否失效  0：正常  1：删除
     createdAt:Number//建立日期时间

});


//拼车- 新闻内容
var  CarpoolNewSchema =new Schema({
      newTitle:String,  //标题
      newContent :String, //内容
      newAuthor:String  ,//作者 
      pictureId :String, //保存的图片ID
      createdAt:Number
});

//微信的openId保存表Account
var WxAccountSchema = new Schema({
    wxOpenId : String, //微信openId,加密后的
    userId : String,
    userName : String,
    company : String,
    createTime : Number,
    updateTime : Number
});



var TestSchema = new Schema({
    time:String
});


//test
var FooSchema =new Schema({
	startDateHour:Number,
	carpoolType:Number,
	startAddress:String,
	arriveAddress:String
	
});


exports.FooSchema=FooSchema;
exports.WxAccountSchema=WxAccountSchema;

exports.CarpoolTralvelSchema = CarpoolTralvelSchema;
exports.CarpoolCarSchema = CarpoolCarSchema;
exports.CarpoolCreditSchema = CarpoolCreditSchema;
exports.CarpoolEvaluateSchema = CarpoolEvaluateSchema;
exports.CarpoolRejectSchema = CarpoolRejectSchema;
exports.CarpoolDeclareSchema = CarpoolDeclareSchema;
exports.CarpoolAttachmentSchema = CarpoolAttachmentSchema;
exports.CarpoolSeriaNumberSchema = CarpoolSeriaNumberSchema;
exports.CarpoolTravelCountSchema = CarpoolTravelCountSchema;
exports.CarpoolCancelTravelSchema = CarpoolCancelTravelSchema;
exports.CarpoolAutoPublishTravelSchema = CarpoolAutoPublishTravelSchema;
exports.BasePushMessageSchema = BasePushMessageSchema;
exports.TestSchema = TestSchema;
exports.CitySchema =CitySchema;
exports.CommonAddressSchema=CommonAddressSchema;
exports.CarpoolUserSchema=CarpoolUserSchema;

exports.CarpoolPictureSchema= CarpoolPictureSchema;
exports.CarpoolNewSchema=CarpoolNewSchema;