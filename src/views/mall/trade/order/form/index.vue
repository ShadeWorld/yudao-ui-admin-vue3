<script setup lang="ts">
import MemberSelect from '@/components/MemberSelect/src/MemberSelect.vue'
import { getAddressList } from '@/api/member/address'
import { getDeliveryPrice, getSimpleTemplateList } from '@/api/mall/trade/delivery/expressTemplate'
import { OrderItemList } from '@/views/mall/trade/order/components'
import ChooseProductForm from './ChooseProductForm.vue'
import ProcessOrderItem from '../components/ProcessOrderItem.vue'
import { formatToFraction } from '@/utils'
import { useTagsViewStore } from '@/store/modules/tagsView'
import * as TradeOrderApi from '@/api/mall/trade/order'
import { LensCraftApi } from '@/api/mall/product/craft'
import { FormInstance } from 'element-plus'
import { DICT_TYPE, getStrDictOptions } from '@/utils/dict'
import { TradeOrderTypeEnum } from '@/utils/constants'

defineOptions({ name: 'TradeOrderAdd' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const { push, currentRoute } = useRouter() // 路由
const { delView } = useTagsViewStore() // 标签页操作

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formData = reactive<TradeOrderApi.CreateOrUpdateVO>({
  type: '0',
  userId: undefined,
  addressId: undefined,
  deliveryTemplateId: undefined,
  remark: undefined,
  craftList: [],
  items: [],
  orderSource: 2 // 1-微信小程序、2-手工录入
})
const craftPrice = computed(() => {
  return formData.craftList?.reduce((prev, cur) => prev + cur.price!, 0)
})
const rules = reactive({
  userId: [
    {
      required: true,
      trigger: 'change',
      message: '请选择客户'
    }
  ],
  addressId: [
    {
      required: true,
      trigger: 'change',
      message: '请选择收货地址'
    }
  ],
  deliveryTemplateId: [
    {
      required: true,
      trigger: 'change',
      message: '请选择配送方式'
    }
  ]
})
const formRef = ref<FormInstance>()
const processItemRef = ref() // 加工商品信息表单
const craftConfigList = ref<any[]>([]) // 工艺配置列表

// 所有商品总价
const allProductPrice = computed(() => {
  if (formData.type === TradeOrderTypeEnum.NORMAL) {
    return formData.items?.reduce((acc, item) => acc + item.price * item.count, 0)
  } else {
    return processItemRef.value?.productPrice()
  }
})

const chooseProductFormRef = ref()

const addressList = ref<any>()
const areaId = ref<number | undefined>()
watch(areaId, (data: number) => {
  getSimpleTemplateList(data).then((res) => {
    expressList.value = res
  })
})

const selectUser = (item) => {
  getAddressList({ userId: item.id }).then((response) => {
    addressList.value = response
    if (response.length > 0) {
      formData.addressId = response[0].id
      response.forEach((item) => {
        if (item.defaultStatus) {
          formData.addressId = item.id
          areaId.value = item.areaId
        }
      })
    }
  })
}

const expressList = ref<any>()

onMounted(() => {
  LensCraftApi.getSimpleCraftList().then((res) => {
    craftConfigList.value = res
  })
})

/**
 * 添加商品的回调
 * @param checkedSpu
 */
const onConfirm = (checkedSpu) => {
  checkedSpu.lensList.forEach((item) => {
    let existsItem = formData.items?.find((i) => i.skuId === item.skuId)
    if (existsItem) {
      existsItem.count += item.count
      let existsLens = existsItem.orderLensList?.find(
        (i) => i.sph === item.sph && i.cyl === item.cyl && i.add === item.add
      )
      if (existsLens) {
        existsLens.count += item.count
      } else {
        existsItem.orderLensList?.push({
          sph: item.sph,
          cyl: item.cyl,
          add: item.add,
          count: item.count,
          leftOrRight: item.leftOrRight,
          axis: item.axis
        })
      }
    } else {
      formData.items?.push({
        skus: checkedSpu.skus,
        spuId: checkedSpu.id,
        distinguishEye: checkedSpu.distinguishEye,
        categoryId: checkedSpu.categoryId,
        spuName: checkedSpu.name,
        skuId: item.skuId,
        price: item.price,
        count: item.count,
        orderLensList: [
          {
            sph: item.sph,
            cyl: item.cyl,
            add: item.add,
            count: item.count,
            leftOrRight: item.leftOrRight,
            axis: item.axis
          }
        ]
      })
    }
  })
}

// 计算运费
const deliveryPrice = ref<number>(0)
const onChangeDelivery = (value: number) => {
  getDeliveryPrice(value, areaId.value as number).then((value) => (deliveryPrice.value = value))
}

// 提交订单
const submitForm = async () => {
  // 提交请求
  formLoading.value = true
  try {
    await processItemRef.value?.validate()
    await formRef.value?.validate()
    if (formData.type == TradeOrderTypeEnum.NORMAL && !formData.items?.length) {
      message.error('至少选择一个商品！')
      return
    }
    await TradeOrderApi.createOrder(formData)
    message.success(t('common.createSuccess'))
    close()
  } finally {
    formLoading.value = false
  }
}

const close = () => {
  delView(unref(currentRoute))
  push({ name: 'TradeOrder' })
}
const changeType = () => {
  formData.craftList?.splice(0, formData.craftList.length)
  formData.items?.splice(0, formData.items.length)
}
</script>

<template>
  <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
    <ContentWrap v-loading="formLoading">
      <el-row justify="end">
        <el-col :span="10">
          <el-row>
            <el-col :span="24">
              <el-form-item label="客户" prop="userId">
                <MemberSelect v-model="formData.userId" class="w-100%!" @select="selectUser" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="收货地址" prop="addressId">
                <el-select
                  v-model="formData.addressId"
                  placeholder="请选择收货地址"
                  @change="
                    (value) => {
                      areaId = value.areaId
                    }
                  "
                >
                  <el-option
                    v-for="item in addressList"
                    :key="item.id"
                    :label="item.name + ' ' + item.areaName + ' ' + item.detailAddress + ' ' + item.mobile"
                    :value="item.id as number"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="配送方式" prop="deliveryTemplateId">
                <el-select
                  v-model="formData.deliveryTemplateId"
                  placeholder="请选择配送方式"
                  :disabled="!formData.userId"
                  @change="onChangeDelivery"
                >
                  <el-option v-for="item in expressList" :key="item.id" :label="item.name" :value="item.id as number" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="备注" prop="remark">
                <el-input v-model="formData.remark" type="textarea" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="运费" class="bold-label"> {{ formatToFraction(deliveryPrice) }} 元</el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="工艺费用" class="bold-label" v-if="TradeOrderTypeEnum.PROCESS == formData.type">
                {{ formatToFraction(craftPrice) }} 元
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="商品总价" class="bold-label">
                {{ formatToFraction(allProductPrice) }} 元
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="14">
          <el-row>
            <el-col :span="12">
              <el-form-item label="订单类型" prop="type">
                <el-select v-model="formData.type" class="!w-280px" @change="changeType">
                  <el-option
                    v-for="dict in getStrDictOptions(DICT_TYPE.TRADE_ORDER_TYPE)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="工艺" prop="craftList" v-if="TradeOrderTypeEnum.PROCESS == formData.type">
                <el-select
                  v-model="formData.craftList"
                  value-key="craftId"
                  multiple
                  placeholder="请选择镜片工艺"
                  class="!w-280px"
                >
                  <el-option
                    v-for="craft in craftConfigList"
                    :key="craft.id"
                    :label="`${craft.craftName} ${formatToFraction(craft.price)}元`"
                    :value="{ craftId: craft.id, craftName: craft.craftName, price: craft.price }"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <template v-if="TradeOrderTypeEnum.NORMAL == formData.type">
                <el-form-item label="商品列表" prop="items">
                  <el-button
                    :disabled="!formData.userId"
                    class="mb-10px mr-15px"
                    @click="
                      () => {
                        chooseProductFormRef.open()
                      }
                    "
                    >添加商品
                  </el-button>
                  <OrderItemList v-model="formData.items" />
                </el-form-item>
              </template>
              <template v-if="TradeOrderTypeEnum.PROCESS == formData.type">
                <ProcessOrderItem ref="processItemRef" v-model="formData.items" />
              </template>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
      <el-row justify="end">
        <el-button :loading="formLoading" type="primary" @click="submitForm"> 保存</el-button>
        <el-button @click="close">返回</el-button>
      </el-row>
    </ContentWrap>
  </el-form>
  <ChooseProductForm ref="chooseProductFormRef" @confirm="onConfirm" />
</template>

<style scoped lang="scss">
.bold-label {
  color: #29b6f6;
  font-weight: bold;
}

.content-wrap {
  padding: 0 20px;
}
</style>
