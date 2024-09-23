<template>
  <Dialog title="余额充值" v-model="dialogVisible" width="600">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" v-loading="formLoading">
      <el-form-item label="用户编号" prop="id">
        <el-input v-model="formData.id" class="!w-240px" disabled />
      </el-form-item>
      <el-form-item label="用户昵称" prop="nickname">
        <el-input v-model="formData.nickname" class="!w-240px" disabled />
      </el-form-item>
      <el-form-item label="当前余额" prop="balance">
        <el-input-number v-model="formData.balance" class="!w-240px" disabled />
      </el-form-item>
      <!--      <el-form-item label="变动类型" prop="changeType">-->
      <!--        <el-radio-group v-model="formData.changeType">-->
      <!--          <el-radio :label="1">增加</el-radio>-->
      <!--          <el-radio :label="-1">减少</el-radio>-->
      <!--        </el-radio-group>-->
      <!--      </el-form-item>-->
      <el-form-item label="充值金额" prop="changeValue">
        <el-input-number v-model="formData.changeValue" class="!w-240px" :min="0" :precision="0" />
      </el-form-item>
      <el-form-item label="充值后余额">
        <el-input-number v-model="balanceResult" class="!w-240px" disabled />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import * as UserApi from '@/api/member/user'
import { cloneDeep } from 'lodash-es'
import { convertToInteger } from '@/utils'

/** 修改用户积分表单 */
defineOptions({ name: 'UpdatePointForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formData = ref({
  id: undefined,
  nickname: undefined,
  balance: 0,
  changeValue: 0,
  changeType: 1
})
const formRules = reactive({
  changeValue: [{ required: true, message: '充值金额不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (id?: number) => {
  dialogVisible.value = true
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await UserApi.getUser(id)
      formData.value.balance = formData.value.balance! / 100
      formData.value.changeType = 1 // 默认增加积分
      formData.value.changeValue = 0 // 变动积分默认0
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return

  if (formData.value.changeValue < 0) {
    message.error('充值金额不能小于 0')
    return
  }

  // 深拷贝一份用于提交
  const data = cloneDeep(unref(formData))

  // 提交请求
  formLoading.value = true
  try {
    await UserApi.recharge({
      userId: data.id,
      payPrice: convertToInteger(data.changeValue * data.changeType),
      userType: 1
    })

    message.success(t('common.updateSuccess'))
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    nickname: undefined,
    balance: 0,
    changeValue: 0,
    changeType: 1
  }
  formRef.value?.resetFields()
}

/** 变动后的积分 */
const balanceResult = computed(() => formData.value.balance + formData.value.changeValue * formData.value.changeType)
</script>
