import request from '@/config/axios'

export interface Property {
  propertyId?: number // 属性编号
  propertyName?: string // 属性名称
  valueId?: number // 属性值编号
  valueName?: string // 属性值名称
}

export interface LensTag {
  minSph?: number
  maxSph?: number
  centerThickness?: number // 中心厚度
  diameter?: string // 直径
}

export interface LensProperty {
  id?: number
  series?: string // 系列
  kind?: string // 品种
  refractive?: string // 折射率
  filmLayer?: string // 膜层
  standard?: string // 执行标准
  abbe?: string // 阿贝系数
  color?: string // 颜色
  transmittance?: string // 透射比
  distinguishEye?: boolean // 是否区分左右眼
}

export interface Sku {
  id?: number // 商品 SKU 编号
  name?: string // 商品 SKU 名称
  spuId?: number // SPU 编号
  properties?: Property[] // 属性数组
  price?: number | string // 商品价格
  agentPrice?: number | string // 代理价
  marketPrice?: number | string // 市场价
  costPrice?: number | string // 成本价
  barCode?: string // 商品条码
  picUrl?: string // 图片地址
  weight?: number // 商品重量，单位：kg 千克
  volume?: number // 商品体积，单位：m^3 平米
  firstBrokeragePrice?: number | string // 一级分销的佣金
  secondBrokeragePrice?: number | string // 二级分销的佣金
  salesCount?: number // 商品销量
  skuLens?: SkuLens
}

export interface SkuLens {
  id: number
  minSph: number // 起始球镜
  maxSph: number
  skipSph: number[]
  minCyl: number // 起始柱镜
  maxCyl: number
  skipCyl: number[]
  minAdd: number
  maxAdd: number
  skipAdd: number[]
  minUnion: number
  maxUnion: number
}

export interface GiveCouponTemplate {
  id?: number
  name?: string // 优惠券名称
}

export interface Spu {
  id?: number
  name?: string // 商品名称
  categoryId?: number // 商品分类
  lensProperty?: LensProperty // 属性数组
  lensTags: LensTag[]
  keyword?: string // 关键字
  unit?: number | undefined // 单位
  picUrl?: string // 商品封面图
  sliderPicUrls?: string[] // 商品轮播图
  introduction?: string // 商品简介
  deliveryTypes?: number[] // 配送方式
  deliveryTemplateId?: number | undefined // 运费模版
  brandId?: number // 商品品牌编号
  specType?: boolean // 商品规格
  skus?: Sku[] // sku数组
  description?: string // 商品详情
  sort?: number // 商品排序
  virtualSalesCount?: number // 虚拟销量
  price?: number // 商品价格
  salesCount?: number // 商品销量
  marketPrice?: number // 市场价
  costPrice?: number // 成本价
  createTime?: Date // 商品创建时间
  status?: number // 商品状态
}

export interface CascadeReqVO {
  userId?: number
  categoryId?: number
  brandId?: number
  series?: string
  kind?: string
  refractive?: string
  filmLayer?: string
}

// 获得 Spu 列表
export const getSpuPage = (params: PageParam) => {
  return request.get({ url: '/product/spu/page', params })
}

// 获得 Spu 列表 tabsCount
export const getTabsCount = () => {
  return request.get({ url: '/product/spu/get-count' })
}

// 创建商品 Spu
export const createSpu = (data: Spu) => {
  return request.post({ url: '/product/spu/create', data })
}

// 更新商品 Spu
export const updateSpu = (data: Spu) => {
  return request.put({ url: '/product/spu/update', data })
}

// 更新商品 Spu status
export const updateStatus = (data: { id: number; status: number }) => {
  return request.put({ url: '/product/spu/update-status', data })
}

// 获得商品 Spu
export const getSpu = (id: number) => {
  return request.get({ url: `/product/spu/get-detail?id=${id}` })
}

// 获得商品 Spu
export const getLensSpu = (params: CascadeReqVO) => {
  return request.get({ url: `/product/spu/get-detail`, params })
}

// 获得商品 Spu 详情列表
export const getSpuDetailList = (ids: number[]) => {
  return request.get({ url: `/product/spu/list?spuIds=${ids}` })
}

// 删除商品 Spu
export const deleteSpu = (id: number) => {
  return request.delete({ url: `/product/spu/delete?id=${id}` })
}

// 导出商品 Spu Excel
export const exportSpu = async (params) => {
  return await request.download({ url: '/product/spu/export', params })
}

// 获得商品 SPU 精简列表
export const getSpuSimpleList = async () => {
  return request.get({ url: '/product/spu/list-all-simple' })
}

// 获得商品种类列表
export const getCategoryList = async (ids: number[] = []) => {
  return request.get({ url: `/product/spu/categoryList?idStr=${ids.join(',')}` })
}

// 获得商品品牌列表
export const getBrandList = async (params: CascadeReqVO) => {
  return request.get({ url: '/product/spu/brandList', params })
}

// 获得镜片系列列表
export const getLenSeriesList = async (params: CascadeReqVO) => {
  return request.get({ url: '/product/spu/lensSeriesList', params })
}

// 获得镜片品种列表
export const getLenKindList = async (params: CascadeReqVO) => {
  return request.get({ url: '/product/spu/lensKindList', params })
}

// 获得镜片折射率列表
export const getLenRefractiveList = async (params: CascadeReqVO) => {
  return request.get({ url: '/product/spu/lensRefractiveList', params })
}

// 获得镜片膜层列表
export const getLenFilmLayerList = async (params: CascadeReqVO) => {
  return request.get({ url: '/product/spu/lensFilmLayerList', params })
}
