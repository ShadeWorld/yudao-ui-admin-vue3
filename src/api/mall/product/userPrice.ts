import request from '@/config/axios'

/**
 * 商品属性
 */
export interface UserPriceVO {
  id?: number
  /** 用户编号 */
  userId: number
  /** sku编号 */
  skuId: number
  /** 价格 */
  price: number
}

/**
 * 商品属性
 */
export interface UserPricePageVO {
  id?: number
  /** sku编号 */
  skuId: number
  /** 商品名称 */
  productName: string
  /** sku名称 */
  skuName: string
  /** 光度范围或属性名 */
  skuLens: any
  /** 商品默认价格 */
  skuPrice: number | string
  /** 用户价格 */
  userPrice: number | string
}

// ------------------------ 属性项 -------------------

// 保存用户价格
export const saveUserPrice = (data: UserPriceVO) => {
  return request.put({ url: '/product/user-price/save', data })
}
// 获得用户价格分页
export const getSkuPricePage = (params: PageParam & any) => {
  return request.get({ url: '/product/user-price/sku-price-page', params })
}
