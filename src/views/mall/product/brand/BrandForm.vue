<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="80px"
      v-loading="formLoading"
    >
      <el-form-item label="品牌名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入品牌名称" />
      </el-form-item>
      <el-form-item label="商品分类" prop="categoryIds">
        <el-cascader
          v-model="formData.categoryIds"
          :options="categoryList"
          :props="treeProps"
          class="w-1/1"
          clearable
          filterable
          placeholder="请选择商品分类"
        />
      </el-form-item>
      <el-form-item label="品牌图片" prop="picUrl">
        <UploadImg v-model="formData.picUrl" :limit="1" :is-show-tip="false" />
      </el-form-item>
      <el-form-item label="品牌排序" prop="sort">
        <el-input-number v-model="formData.sort" controls-position="right" :min="0" />
      </el-form-item>
      <el-form-item label="品牌状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="品牌描述">
        <el-input v-model="formData.description" type="textarea" placeholder="请输入品牌描述" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import * as ProductBrandApi from '@/api/mall/product/brand'
import { defaultProps, handleTree, treeToString } from '@/utils/tree'
import * as ProductCategoryApi from '@/api/mall/product/category'

defineOptions({ name: 'ProductBrandForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  name: '',
  categoryIds: [],
  picUrl: '',
  status: CommonStatusEnum.ENABLE,
  description: ''
})
const formRules = reactive({
  name: [{ required: true, message: '品牌名称不能为空', trigger: 'blur' }],
  categoryIds: [{ required: true, message: '商品分类不能为空', trigger: 'blur' }],
  picUrl: [{ required: true, message: '品牌图片不能为空', trigger: 'blur' }],
  sort: [{ required: true, message: '品牌排序不能为空', trigger: 'blur' }]
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
      formData.value = await ProductBrandApi.getBrand(id)
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
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as ProductBrandApi.BrandVO
    if (formType.value === 'create') {
      await ProductBrandApi.createBrand(data)
      message.success(t('common.createSuccess'))
    } else {
      await ProductBrandApi.updateBrand(data)
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
    name: '',
    picUrl: '',
    status: CommonStatusEnum.ENABLE,
    description: ''
  }
  formRef.value?.resetFields()
}

/** 获取分类的节点的完整结构 */
const categoryList = ref() // 分类树
const formatCategoryName = (categoryId: number) => {
  return treeToString(categoryList.value, categoryId)
}

/** 多选下拉 */
const treeProps = {
  multiple: true,
  children: 'children',
  label: 'name',
  value: 'id',
  isLeaf: 'leaf',
  emitPath: false // 用于 cascader 组件：在选中节点改变时，是否返回由该节点所在的各级菜单的值所组成的数组，若设置 false，则只返回该节点的值
}

onMounted(async () => {
  // 获得分类树
  const data = await ProductCategoryApi.getCategoryList({})
  categoryList.value = handleTree(data, 'id', 'parentId')
})

</script>
