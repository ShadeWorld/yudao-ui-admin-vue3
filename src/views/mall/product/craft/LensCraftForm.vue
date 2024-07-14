<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" v-loading="formLoading">
      <el-form-item label="工艺名字" prop="craftName">
        <el-input v-model="formData.craftName" placeholder="请输入工艺名字" />
      </el-form-item>
      <el-form-item label="工艺价格" prop="price">
        <el-input v-model="formData.price" placeholder="请输入工艺价格" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { LensCraftApi, LensCraftSaveVO } from '@/api/mall/product/craft'
import { cloneDeep } from 'lodash-es'
import { floatToFixed2, yuanToFen } from '@/utils'

/** 加工配置 表单 */
defineOptions({ name: 'LensCraftForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  craftName: undefined,
  price: undefined
})
const formRules = reactive({
  craftName: [{ required: true, message: '工艺名字不能为空', trigger: 'blur' }],
  price: [{ required: true, message: '工艺价格不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await LensCraftApi.getLensCraft(id)
      formData.value.price = floatToFixed2(formData.value.price)
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
  await formRef.value.validate()

  // 深拷贝一份, 这样最终 server 端不满足，不需要影响原始数据
  const deepCopyFormData: LensCraftSaveVO = cloneDeep(unref(formData.value)) as unknown as LensCraftSaveVO

  // 价格元转分
  deepCopyFormData.price = yuanToFen(deepCopyFormData.price)

  // 提交请求
  formLoading.value = true
  try {
    if (formType.value === 'create') {
      await LensCraftApi.createLensCraft(deepCopyFormData)
      message.success(t('common.createSuccess'))
    } else {
      await LensCraftApi.updateLensCraft(deepCopyFormData)
      message.success(t('common.updateSuccess'))
    }
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
    craftName: undefined,
    price: undefined
  }
  formRef.value?.resetFields()
}
</script>
