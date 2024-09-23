import request from '@/config/axios'

export interface UserVO {
  id: number
  userId: number | undefined
  userName: string | undefined
  avatar: string | undefined
  createTime: number | undefined
  loginDate: number | undefined
  loginIp: string
  mark: string
  mobile: string
  companyName: string
  legalPerson: string
  contactPerson: string
  businessLicense: string
  shopFront: string
  recommender: string | undefined
  nickname: string | undefined
  registerIp: string
  status: number
  areaId: number | undefined
  areaName: string | undefined
  levelName: string | null
  point: number | undefined | null
  totalPoint: number | undefined | null
  experience: number | null | undefined
}

// 查询会员用户列表
export const getUserPage = async (params) => {
  return await request.get({ url: `/member/user/page`, params })
}

// 查询会员用户详情
export const getUser = async (id: number) => {
  return await request.get({ url: `/member/user/get?id=` + id })
}

// 修改会员用户
export const createUser = async (data: UserVO) => {
  return await request.post({ url: `/member/user/create`, data })
}

// 修改会员用户
export const updateUser = async (data: UserVO) => {
  return await request.put({ url: `/member/user/update`, data })
}

// 修改会员用户等级
export const updateUserLevel = async (data: any) => {
  return await request.put({ url: `/member/user/update-level`, data })
}

// 修改会员用户积分
export const updateUserPoint = async (data: any) => {
  return await request.put({ url: `/member/user/update-point`, data })
}

// 会员充值
export const recharge = async (data: any) => {
  return await request.put({ url: `/member/user/recharge`, data })
}

// 获取当前登录业务员简单会员列表
export const getSimpleMemberList = async (key: string) => {
  return await request.get({ url: `/member/user/simple-list?key=${key}` })
}
