<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" v-loading="formLoading">
      <!--      <el-form-item label="手机号" prop="mobile">-->
      <!--        <el-input v-model="formData.mobile" placeholder="请输入手机号" />-->
      <!--      </el-form-item>-->
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio v-for="dict in getIntDictOptions(DICT_TYPE.MEMBER_STATUS)" :key="dict.value" :label="dict.value">
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="是否代理商" prop="isAgent">
        <el-radio-group v-model="formData.isAgent">
          <el-radio :label="true"> 是 </el-radio>
          <el-radio :label="false"> 否 </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="业务员" prop="userId">
        <el-select v-model="formData.userId" placeholder="请选择业务员">
          <el-option v-for="user in userList" :key="user.id" :label="user.nickname" :value="user.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="用户昵称" prop="nickname" v-if="formType === 'update'">
        <el-input v-model="formData.nickname" placeholder="请输入用户昵称" />
      </el-form-item>
      <!--      <el-form-item label="头像" prop="avatar">-->
      <!--        <UploadImg v-model="formData.avatar" :limit="1" :is-show-tip="false" />-->
      <!--      </el-form-item>-->
      <el-form-item label="联系人姓名" prop="contactPerson">
        <el-input v-model="formData.contactPerson" placeholder="请输入联系人姓名" />
      </el-form-item>
      <el-form-item label="联系人助记码" prop="mnemonic" v-if="formType === 'update'">
        <el-input v-model="formData.mnemonic" placeholder="请输入联系人助记码" />
      </el-form-item>
      <el-form-item label="手机号码" prop="mobile">
        <el-input v-model="formData.mobile" placeholder="请输入手机号码" />
      </el-form-item>
      <!--      <el-form-item label="用户性别" prop="sex">-->
      <!--        <el-radio-group v-model="formData.sex">-->
      <!--          <el-radio-->
      <!--            v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_USER_SEX)"-->
      <!--            :key="dict.value"-->
      <!--            :label="dict.value"-->
      <!--          >-->
      <!--            {{ dict.label }}-->
      <!--          </el-radio>-->
      <!--        </el-radio-group>-->
      <!--      </el-form-item>-->
      <!--      <el-form-item label="出生日期" prop="birthday">-->
      <!--        <el-date-picker-->
      <!--          v-model="formData.birthday"-->
      <!--          type="date"-->
      <!--          value-format="x"-->
      <!--          placeholder="选择出生日期"-->
      <!--        />-->
      <!--      </el-form-item>-->
      <el-form-item label="请选择地址" prop="areaId">
        <el-tree-select v-model="formData.areaId" :data="areaList" :props="defaultProps" :render-after-expand="true" />
      </el-form-item>
      <el-form-item label="详细地址" prop="address" v-if="formType === 'create'">
        <el-input v-model="formData.address" placeholder="请输入详细地址" />
      </el-form-item>
      <el-form-item label="公司（店名）" prop="companyName">
        <el-input v-model="formData.companyName" placeholder="请输入公司（店名）" />
      </el-form-item>
      <el-form-item label="用户标签" prop="tagIds">
        <MemberTagSelect v-model="formData.tagIds" show-add />
      </el-form-item>
      <el-form-item label="用户分组" prop="groupId">
        <MemberGroupSelect v-model="formData.groupId" />
      </el-form-item>
      <el-form-item label="会员备注" prop="mark">
        <el-input type="textarea" v-model="formData.mark" placeholder="请输入会员备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as UserApi from '@/api/member/user'
import * as AreaApi from '@/api/system/area'
import * as SysUserApi from '@/api/system/user'
import { defaultProps } from '@/utils/tree'
import MemberTagSelect from '@/views/member/tag/components/MemberTagSelect.vue'
import MemberGroupSelect from '@/views/member/group/components/MemberGroupSelect.vue'

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  mobile: undefined,
  password: undefined,
  status: undefined,
  isAgent: false,
  contactPerson: undefined,
  mnemonic: undefined,
  userId: undefined,
  nickname: undefined,
  avatar: undefined,
  companyName: undefined,
  address: undefined,
  areaId: undefined,
  mark: undefined,
  tagIds: [],
  groupId: undefined
})
const formRules = reactive({
  mobile: [{ required: true, message: '手机号不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
  userId: [{ required: true, message: '业务员不能为空', trigger: 'change' }],
  areaId: [{ required: true, message: '地址不能为空', trigger: 'change' }],
  contactPerson: [{ required: true, message: '联系人不能为空', trigger: 'blur' }],
  address: [{ required: true, message: '详细地址不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref
const areaList = ref([]) // 地区列表
const userList = ref<any[]>([]) // 用户列表

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
      formData.value = await UserApi.getUser(id)
    } finally {
      formLoading.value = false
    }
  }
  // 获得地区列表
  areaList.value = await AreaApi.getAreaTree()
  // 加载用户列表
  userList.value = await SysUserApi.getSimpleUserList()
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
    const data = formData.value as unknown as UserApi.UserVO
    if (formType.value === 'create') {
      // 说明：目前暂时没有新增操作。如果自己业务需要，可以进行扩展
      await UserApi.createUser(data)
      message.success(t('common.createSuccess'))
    } else {
      await UserApi.updateUser(data)
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
    mobile: undefined,
    password: undefined,
    status: undefined,
    isAgent: false,
    userId: undefined,
    nickname: undefined,
    contactPerson: undefined,
    mnemonic: undefined,
    avatar: undefined,
    companyName: undefined,
    areaId: undefined,
    address: undefined,
    mark: undefined,
    tagIds: [],
    groupId: undefined
  }
  formRef.value?.resetFields()
}
</script>
