var mongoose = require("mongoose");
var Schema = mongoose.Schema;

//行程
var CarpoolTralvelSchema = new Schema({
    car:{
        type:Schema.Types.ObjectId,
        ref:"carpoolCar"
    },//车辆信息
    travel:{
        type:Schema.Types.ObjectId,
        ref:"carpoolTralvel"
    },//搭车人引用的开车人发起的CarpoolTralvel id
    userId:String,//用户id
    userName:String,//用户名字
    userType:Number,//1:开车人;2:搭车人
    startProvince:String,//出发省份
    startCityCode:String,//出发城市代码
    startCity:String,//出发城市
    startAddress:String,//出发地点
    arriveProvince:String,//到达省份
    arriveCityCode:String,//达到城市代码
    arriveCity:String,//达到城市
    arriveAddress:String,//到达地点
    startDate:Number,//出发日期时间
    travelSerialNumber:String,//行程流水号(8位数字，递增)
    twoDimensionalCode:String,//二维码（行程流水号+开车人id+搭车人id）整体base64
    seatCount:Number,//提供座位数
    bookedSeatCount:Number,//已预定座位数
    seatState:Number,//0 未满；1已满；
    filter:[],//要求 
    state:Number,//0:正常     1:被踢     2:取消行程     3取消预约
    validateState:Number,//扫码是否成功   0:否    1:是
    createdAt:Number,//建立日期时间
    updateTime:Number,//最后修改日期时间
    createUser:String,//创建人
    remark:String,  //备注
    autoPublishTravelId:String//自动发布行程id
});

//汽车
var CarpoolCarSchema = new Schema({
    carOwnerId:String,//车主id(工号)
    carOwnerName:String,//车主姓名
    carType:String,//车型 suv  房车
    carSeat:Number,//座位数
    carModel:String,//品牌 bmw
    carColor:String,//颜色id
    carNumber:String,//车牌
    carImg:{
        type:Schema.Types.ObjectId,
        ref:"carpoolAttachment"
    },//图片
    fileURL:String,//图片url
    fileURL2:String,
    state:Number,//1:正常    2:删除
    createdAt:Number,//建立日期时间
    updateTime:Number//最后修改日期时间
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
    type:Number,//1司机取消;2乘客取消;
    reason:String,
    createdAt:Number
    
});

//拼车声明
var CarpoolDeclareSchema = new Schema({
    content:String,//声明内容
    createAt:Number//创建时间
});

//附件信息
var CarpoolAttachmentSchema = new Schema({
    userId:String,//所有人
    fileName:String,//文件名
    orinalFileName:String,//原始文件名
    fileSize:Number,//文件大小
    filePath:String,//文件路径,
    fileURL:String,//压缩后小尺寸文件网络路径
    filePath2:String,//压缩后原始尺寸文件网络路径
    createdAt:Number//建立日期时间
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

var TestSchema = new Schema({
    time:String
});

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
