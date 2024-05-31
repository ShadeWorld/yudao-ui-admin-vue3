<script setup lang="ts">
import MemberSelect from '@/components/MemberSelect/src/MemberSelect.vue'
import { CreateOrderReqVo } from '@/api/mall/trade/order'
import { getAddressList } from '@/api/member/address'
import { getSimpleTemplateList } from '@/api/mall/trade/delivery/expressTemplate'
import { OrderItemList } from '@/views/mall/trade/order/components'
import ChooseProductForm from './ChooseProductForm.vue'

defineOptions({ name: 'TradeOrderAdd' })

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formData = reactive<CreateOrderReqVo>({
  userId: undefined,
  addressId: undefined,
  logisticsId: undefined,
  items: []
})
const rules = reactive({
  userId: [required]
})
const formRef = ref()

const addressList = ref<any>()

const selectUser = (item) => {
  getAddressList({ userId: item.id }).then((response) => {
    addressList.value = response
    if (response.length > 0) {
      formData.addressId = response[0].id
      response.forEach((item) => {
        if (item.defaultStatus) {
          formData.addressId = item.id
        }
      })
    }
  })
}

const expressList = ref<any>()

onMounted(() => {
  getSimpleTemplateList().then((res) => {
    expressList.value = res
  })
})

const onConfirm = (checkedSpu) => {
  checkedSpu.lensList.forEach((item) => {
    let orderItem = {
      spuId: checkedSpu.id,
      spuName: checkedSpu.name,
      skuId: item.skuId,
      price: item.price,
      count: item.count,
      orderLens: {
        sph: item.sph,
        cyl: item.cyl,
        add: item.add
      }
    }
    let existsItem = formData.items?.find(
      (i) =>
        i.skuId == item.skuId && JSON.stringify(i.orderLens) === JSON.stringify(orderItem.orderLens)
    )
    if (existsItem) {
      existsItem.count += item.count
      existsItem.price += item.price
    } else {
      formData.items.push(orderItem)
    }
  })
}

const chooseProductFormRef = ref()
</script>

<template>
  <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
    <ContentWrap v-loading="formLoading">
      <el-row>
        <el-col :span="12">
          <el-form-item label="客户" prop="userId">
            <MemberSelect v-model="formData.userId" class="w-100%!" @select="selectUser" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="收货地址" prop="userId">
            <el-select v-model="formData.addressId" placeholder="请选择收货地址">
              <el-option
                v-for="item in addressList"
                :key="item.id"
                :label="
                  item.name + ' ' + item.areaName + ' ' + item.detailAddress + ' ' + item.mobile
                "
                :value="item.id as number"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="商品列表">
            <el-button
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
        </el-col>
        <el-col :span="6">
          <el-form-item label="配送方式">
            <el-select v-model="formData.logisticsId" placeholder="请选择配送方式">
              <el-option
                v-for="item in expressList"
                :key="item.id"
                :label="item.name"
                :value="item.logisticsId as number"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </ContentWrap>
  </el-form>
  <ChooseProductForm ref="chooseProductFormRef" @confirm="onConfirm" />
</template>

<style scoped lang="scss"></style>
