<script setup lang="ts">
import { OrderItemList } from '@/views/mall/trade/order/components'
import * as TradeOrderApi from '@/api/mall/trade/order'
import ChooseProductForm from '@/views/mall/trade/order/form/ChooseProductForm.vue'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { FormInstance } from 'element-plus'

/** 初始化 */
onMounted(async () => {
  await getDetail()
})

const { params } = useRoute() // 查询参数
const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const { push, currentRoute } = useRouter() // 路由
const { delView } = useTagsViewStore() // 标签页操作

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const chooseProductFormRef = ref() // 选择商品弹窗
const formRef = ref<FormInstance>()

/** 获得详情 */
const getDetail = async () => {
  const id = params.id as unknown as number
  if (id) {
    formLoading.value = true
    try {
      formData.value = (await TradeOrderApi.getOrder(id)) as TradeOrderApi.CreateOrUpdateVO
    } finally {
      formLoading.value = false
    }
  }
}

const formData = ref<TradeOrderApi.CreateOrUpdateVO>({
  items: []
})

/**
 * 添加商品的回调
 * @param checkedSpu
 */
const onConfirm = (checkedSpu) => {
  checkedSpu.lensList.forEach((item) => {
    let existsItem = formData.value.items?.find((i) => i.skuId === item.skuId)
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
      formData.value.items?.push({
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

// 提交订单
const submitForm = async () => {
  // 提交请求
  formLoading.value = true
  try {
    await formRef.value?.validate()
    if (!formData.value.items?.length) {
      message.error('至少选择一个商品！')
      return
    }
    await TradeOrderApi.updateOrderProduct(unref(formData))
    message.success(t('common.updateSuccess'))
    close()
  } finally {
    formLoading.value = false
  }
}

const close = () => {
  delView(unref(currentRoute))
  push({ name: 'TradeOrder' })
}
</script>

<template>
  <ContentWrap v-loading="formLoading">
    <el-form ref="formRef">
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
      <el-form-item style="float: right">
        <el-button :loading="formLoading" type="primary" @click="submitForm"> 保存 </el-button>
        <el-button @click="close">返回</el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>
  <ChooseProductForm ref="chooseProductFormRef" @confirm="onConfirm" />
</template>

<style scoped lang="scss"></style>
