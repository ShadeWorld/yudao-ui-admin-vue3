<script setup lang="ts">
import MemberSelect from '@/components/MemberSelect/src/MemberSelect.vue'
import { CreateOrderReqVo } from '@/api/mall/trade/order'
import { getAddressList } from '@/api/member/address'

const props = defineProps<{
  isDetail: boolean
}>()

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用

const formData = reactive<CreateOrderReqVo>({
  userId: undefined,
  addressId: undefined
})

const rules = reactive({
  userId: [required]
})

const formRef = ref()

const addressList = ref<any>()

const selectUser = (item) => {
  getAddressList({ userId: item.id }).then((response) => {
    addressList.value = response
  })
}
</script>

<template>
  <el-form ref="formRef" :disabled="isDetail" :model="formData" :rules="rules" label-width="120px">
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
      </el-row>
    </ContentWrap>
  </el-form>
</template>

<style scoped lang="scss"></style>
