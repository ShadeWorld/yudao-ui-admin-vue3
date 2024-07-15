import request from '@/config/axios'

// 加工配置 VO
export interface LensCraftVO {
  id: number // 编号，唯一自增。
  craftName: string // 工艺名字
  price: number // 工艺价格（分）
}

// 加工配置 VO
export interface LensCraftSaveVO {
  id?: number // 编号，唯一自增。
  craftName: string // 工艺名字
  price: number // 工艺价格（分）
}

// 加工配置 API
export const LensCraftApi = {
  // 查询加工配置分页
  getLensCraftPage: async (params: any) => {
    return await request.get({ url: `/product/lens-craft/page`, params })
  },

  // 查询加工配置详情
  getLensCraft: async (id: number) => {
    return await request.get({ url: `/product/lens-craft/get?id=` + id })
  },

  // 新增加工配置
  createLensCraft: async (data: LensCraftSaveVO) => {
    return await request.post({ url: `/product/lens-craft/create`, data })
  },

  // 修改加工配置
  updateLensCraft: async (data: LensCraftSaveVO) => {
    return await request.put({ url: `/product/lens-craft/update`, data })
  },

  // 删除加工配置
  deleteLensCraft: async (id: number) => {
    return await request.delete({ url: `/product/lens-craft/delete?id=` + id })
  },

  // 导出加工配置 Excel
  exportLensCraft: async (params) => {
    return await request.download({ url: `/product/lens-craft/export-excel`, params })
  },

  // 获得商品品牌精简信息列表
  getSimpleCraftList: async () => {
    return request.get({ url: '/product/lens-craft/list-all-simple' })
  }
}
