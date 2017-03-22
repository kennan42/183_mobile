/**
 *通讯录数据建模
 * @author donghua.wang
 * @date 2015年8月25日 11:39
 *  */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

//组织机构(base_org)
var BaseOrgSchema = new Schema({
    ZZ_OTYPE: String, //对象类型
    ZZ_OBJ: String, //对象标识(正大天晴集团为"00000001",为最高部门)
    ZZ_OBJT: String, //对象名称
    ZZ_OBJP: String, //拼音
    ZZ_SUB_OTYPE: String, //子对象类型
    ZZ_SUB_OBJ: String, //子对象表示
    ZZ_SUB_OBJT: String, //子对象名称
    ZZ_SUB_OBJP: String, //拼音
    ZZ_OBJ_LEVEL: String, //对象级别
    ZZ_BMFZR: String, //部门负责任
    ZZ_BMFZR_XM: String //部门负责任姓名
});

//员工信息(base_user)
var BaseUserSchema = new Schema({
    PERNR: String, //人员编号
    PLANS: String, //职务
    NACHN: String, //姓名
    VORNA: String, //姓名全拼
    INITS: String, //姓名简拼
    GESCH: String, //性别代码
    GESCH_T: String, //性别文本
    GBDAT: String, //出生日期

    SLART: String, //学历
    STEXT: String, //教育部门文本
    ZZ_SXZY: String, //所学专业
    INSTI: String, //毕业学校

    ZZ_JSZWLB: String, //技术职务类型
    ZZ_JSZWJB: String, //技术职务级别
    ZZ_JSZWJBT: String, //描述  1.一级工程师 二级工程师

    BUKRS: String, //公司代码
    BUTXT: String, //公司代码或公司的名称
    ZZ_GS: String, //公司组织机构编码
    ZZ_GST: String, //公司组织机构描述
    ZZ_JG1: String, //一级部门
    ZZ_JG1T: String, //一级部门描述
    ZZ_JG2: String, //二级部门
    ZZ_JG2T: String, //二级部门描述
    ZZ_JG3: String, //三级部门
    ZZ_JG3T: String, //三级部门描述
    ZZ_JG4: String, //四级部门
    ZZ_JG4T: String, //四级部门描述
    ZZ_JG5: String, //五级部门
    ZZ_JG5T: String, //五级部门描述
    ORGEH: String, //直接隶属单位
    ORGTX: String, //组织单位短文本
    PLSTX: String, //职位名称
    PROZT: String, //权重百分比--值为100%，没有兼职岗位；小于100%，有兼职岗位
    STELL: String, //职务
    STLTX: String, //职务名称
    ZZ_SPCJ: String, //审批层级
    ZZ_SPCJT: String, //审批层级描述
    STAT1: String, //员工状态
    STAT1T: String, //员工状态文本
    ZZ_TEL: String, //手机号
    ZZ_TEL_VIS: Number, //手机是否可见  1可见  0不可见
    ZZ_TEL_SUF: String, //手机后四位
    ZZ_RTX: String, //RTX号 
    ZZ_EMAIL: String, //邮箱
    LINE_MANAGER: String, //直线经理工号
    LM_NACHN: String, //直线经理姓名
    ZZ_RQ: String, //日期
    ZZ_SJ: String, //时间
    WERKS: String, //人事范围
    PBTXT: String, //人事范围文本
    BTRTL: String, //人事子范围
    BTRTX: String, //人员子范围文本
    PERSG: String, //员工组
    PGTXT: String, //员工组的名称
    PERSK: String, //员工子组
    PKTXT: String, //员工子组的名称
    ZZ_XSRY: String, //是否销售人员标识
    ZZ_RZSJ: String, //入职时间
    DATAR: String, //入职时间日期类型

    ZZ_ZZSJ: String, //转正时间
    ZZ_TCSJ: String, //计划离职日期
    ZZ_LZSJ: String, //离职时间
    ZZ_YGSL: String, //员工司龄
    ZZ_CZD: String, //常驻地
    ZZ_CZDA: String, //省(直辖市)
    ZZ_CZDA_T: String, //描述-省名称
    ZZ_CZDB: String, //常驻地：城市
    ZZ_CZDB_T: String, //描述-市名称
    ZZ_CZDC: String, //常驻地：县/区
    ZZ_CZDC_T: String, //描述-县名称
    ZZ_LDBG: String, //两地办公标识
    ZZ_CZD1: String, //第二办公地
    ZZ_CZDA1: String, //省(直辖市)
    ZZ_CZDA1_T: String, //描述-省名称
    ZZ_CZDB1: String, //第二办公地（市）
    ZZ_CZDB1_T: String, //描述-市名称
    ZZ_CZDC1: String, //第二办公地（县/区）
    ZZ_CZDC1_T: String, //描述-县名称
    ZZ_JTTF: String, //是否电话费集团统付
    ZZ_SFPC: String,
      //是否公司配车
    syncTime: Number, //员工信息同步时间
    syncTime2: String, //员工信息同步时间2  string格式
    photoStatus: Number, //照片状态  1有    0没有
    photoURL: String, //压缩照片地址
    photoURL2: String, //原始照片地址
    photoUpdateTime: Number,
    photoNewURL: String, //新图片地址
    photoNewStatus: Number // 是否自定义上传照片  1，有  0没有
});

//组织机构层级
var BaseOrgLevelSchema = new Schema({
    OBJID: String, //组织机构id
    ZZ_JGCJ: Number //层级
});

//备注信息(contact_user_remark)
var ContactUserRemarkSchema = new Schema({
    userId: String, //员工id
    linkmanId: String, //联系人id
    remark: String, //联系人备注
    user: {
        type: Schema.Types.ObjectId,
        ref: "base_user"
    },
    opTime: String //操作时间
});

//通讯录行为分析记录
var ContactActionLogSchema = new Schema({
    userId: String, //用户id
    argId: String, //访问参数
    argName: String, //访问参数名称
    opType: String, //操作类型，eg:查询部门，查询联系人
    opTime: Number //操作时间
});

//用户照片信息
var ContactPhotoSchema = new Schema({
    userId: String,
    status: Number, //1有照片 0没照片
    url: String, //压缩图片路径
    url2: String, //原始图片路径
    createTime: Number
});

//常用联系人 contact_frequent_linkman
var FrequentLinkmanSchema = new Schema({
    userId: String, //
    linkmanId: String, //联系人id
    status: Number, //联系人状态  1正常  0删除
    createTime: Number, //建立时间
    deleteTime: Number //删除时间
});

exports.BaseOrgSchema = BaseOrgSchema;
exports.BaseUserSchema = BaseUserSchema;
exports.BaseOrgLevelSchema = BaseOrgLevelSchema;
exports.ContactUserRemarkSchema = ContactUserRemarkSchema;
exports.ContactActionLogSchema = ContactActionLogSchema;
exports.ContactPhotoSchema = ContactPhotoSchema;
exports.FrequentLinkmanSchema = FrequentLinkmanSchema;
