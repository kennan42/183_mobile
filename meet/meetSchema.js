var mongoose = require("mongoose");
var Schema = mongoose.Schema;


//归属地
var MeetGuishudiSchema=new Schema({
    code:Number,//编码
    name:String,//归属地名称
    type:Number,//状态  1正常  0删除
    admin:[],//[{userId:"",userName},...]管理员
    createUser:[],//{userId:String,userName:String},//建立用户
    createTime:Number,//建立时间，
    hrCompanycode:Number,//HR公司编码,
    hrResidentcode:Number,//HR常驻地编码
    guishudiOrder:Number//归属地显示顺序
});


//会议级别
var MeetTypeSchema=new Schema({
    code:Number,//编码 
    type:String,//会议级别：
    state:Number,//状态  1正常  0删除
    createUser:[],//{userId:String,userName:String},//建立用户
    createTime:Number//建立时间
});


//会议设备
var MeetEquipmentSchema=new Schema({
    code:Number,//编码
    name:String,//设备名称
    descr:String,//设备描述
    type:Number,//状态  1正常  0删除
    createUser:[],//{userId:String,userName:String},
    createTime:Number
});


//会议用品
var MeetGoodsSchema=new Schema({
    code:Number,//编码
    name:String,//名称
    type:Number,//状态  1正常  0删除,
    createUser:[],//{userId:String,userName:String},//{userId:"",userName},
    createTime:Number,
    seatCard:[]//用于席位卡上传图片的地址
});
  
var MeetLevelSchema = new Schema({
    code:Number,
    name:String
});

//会议室
var MeetRoomSchema=new Schema({
    guishudiId:String,//FK  归属地
    guishudiName:String,//归属地名称
    twoDimensionalCode:String ,//（二维码，至少包含会议室编码，保证不能有重码）
    name:String,//会议室名称
    shortName:String,//会议室短描述2016.7.29新增字段
    capacity:String,//容纳人数 10人以下；10到20人；20到30人；30到40人；50人以上
    address:String,//会议室地址
    level:Number,//0普通会议    1高层会议
    needApply:Number,//1需要申请  0不需要申请
    clearMinute:Number,//清场时间分钟数
    type:Number,//1普通会议室   2视频会议室
    state:Number,//1正常   2冻结   3删除  4停用
    admin:[],//[{userId:"",userName},...]管理员
    servicePersonal:[],//服务人员[{userId:"",userName},...]
    technicist:[],//技术支持[{userId:"",userName},...]
    device:[],//会议设备[{code:"",name:""},...]会议室设备
    image:[],//[{imageURL:String,compressedImageURL:String},...],会议室图片
    createUser:Object,//建立人员
    createTime:Number,//建立时间
    updateUser:Object,//最后修改人员
    updateTime:Number,//最后修改时间
    frozenBegin:Number,//冻结开始时间
    frozenEnd:Number,//冻结结束时间
    frozenReason:String,//冻结原因
    index:Number,//排序
    desc:String,//会议室描述
    serialNumber:String,//会议室流水号，数字部分从100000开始
    guishudiOrder:Number,//归属地显示顺序,
    homesector:String,//所属部门2016.10.13
    meetlevel:Number//会议室级别根据capacity来判断2016.10.13,为1,2,3,4,5
});


//会议室预定
var MeetBookSchema=new Schema({
    meetRoom:{
        type:Schema.Types.ObjectId,
        ref:"meetRoom"
    },
    meetRoom2:String,
    name:String,//会议室名称
    shortName:String,//会议室短描述2016.7.29新增字段
    guishudiId:String,//归属地编号
    guishudiName:String,//归属地名称
    needApply:Number,//1需要审批  0不需要审批
    userId:String,//申请人id
    userName:String,//申请人姓名
    userName2:String,//拼音
    tel:String,//申请人电话
    topic:String,//主题
    type:String,//会议级别
    level:String,//最高领导
    userNumber:Number,//参会人数量
    checkUser:[],//审核人[{userId:"",userName},...]
    examineUser:[],//最后有谁审核
    state:Number,//1申请中  2预约成功  3预约失败（包括冻结，停用会议室）4取消预约  5会议结束 6管理员取消7会议中
    goods:[],//所需物品[{code:"",name:""},...]
    devices:[],//预定需要的会议室设备
    servicePersonal:[],//服务人员[{userId:"",userName},...]
    technicist:[],//技术支持[{userId:"",userName},...]
    remark:String,//备注
    startTime:Number,//会议开始时间
    endTime:Number,//会议结束时间
    clearOverTime:Number,//会议室清场完毕时间
    userTimes:Number,//会议用时
    createTime:Number,//创建时间
    checkTime:Number, //审批时间(不需要审批的会议室审批时间就是创建时间)
    comments:String,//审批意见
    ifKuaTian:Number,//0,不跨天；1,跨天
    seatCard:String,//上传文件的地址
    multi:Number,//是否预定了多个会议室 :1是  0否
    participants:[],//与会人员 [{"userId":"","userName":""},...]2016.8.9修改
    ifinform:Number,//是否发送消息给与会人（2016-9-21）0不发送，1发送
    ifremind:Number,//发送短信（2016-9-21）0不提醒 1提醒
    ifremindtoAdmin:Number,//是否给会议室管理员提醒过（2016-9-21）0没提醒 1提醒过了 
    canclereason:String,//取消原因
    applySrc:String//pc app
});

//附件信息
var MeetAttachmentSchema = new Schema({
    userId:String,//上传人
    fileName:String,//原始文件名
    newFileName:String,//新文件名
    filePath:String,//原始文件路径
    compressedFilePath:String,//压缩文件路径
    fileURL:String,//原始文件网络路径
    compressedFileURL:String,//压缩文件网络路径
    fileSize:Number,//原始文件大小
    createdAt:Number//建立日期时间
});

//会议室接口调用日志
var MeetInvokeLogSchema = new Schema({
    invokeType:String,//调用方式 pc,app
    func:String,//功能模块  queryMeetRoom:查询会议室,bookMeetRoom:预定会议室
    guishudiName:String,//用户统计预定信息，当存查询会议室时为空
    needApply:Number,//1需要申请  0不需要申请
    meetRoomType:Number,//1普通会议室   2视频会议室
    createTime:Number
});


exports.MeetGuishudiSchema = MeetGuishudiSchema;
exports.MeetTypeSchema = MeetTypeSchema;
exports.MeetEquipmentSchema = MeetEquipmentSchema;
exports.MeetGoodsSchema = MeetGoodsSchema;
exports.MeetRoomSchema = MeetRoomSchema;
exports.MeetBookSchema = MeetBookSchema;
exports.MeetAttachmentSchema = MeetAttachmentSchema;
exports.MeetLevelSchema = MeetLevelSchema;
exports.MeetInvokeLogSchema = MeetInvokeLogSchema;