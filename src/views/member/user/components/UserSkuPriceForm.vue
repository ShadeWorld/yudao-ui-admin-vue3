<template>
  <Dialog v-model="dialogVisible" :appendToBody="true" title="发送优惠券" width="70%">
    <!-- 搜索工作栏 -->
    <el-form ref="queryFormRef" :inline="true" :model="queryParams" label-width="82px">
      <el-form-item label="商品名称" prop="name">
        <el-input
          v-model="queryParams.name"
          class="!w-240px"
          placeholder="请输入商品名称"
          clearable
          @keyup="handleQuery"
        />
      </el-form-item>
      <el-form-item prop="name">
        <el-checkbox label="已设置价格的商品" v-model="queryParams.existsUserPrice" />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon class="mr-5px" icon="ep:search" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon class="mr-5px" icon="ep:refresh" />
          重置
        </el-button>
        <el-button @click="resetUserPrice" type="primary" :disabled="selectedIds.length === 0">恢复默认值</el-button>
        <el-button @click="resetAll" type="primary"> 重置所有 </el-button>
      </el-form-item>
    </el-form>

    <!-- 列表 -->
    <el-table
      v-loading="loading"
      :data="list"
      :show-overflow-tooltip="true"
      :stripe="true"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column align="center" label="商品名称" prop="productName" min-width="60" />
      <el-table-column align="center" label="光度范围" prop="skuName" min-width="60" />
      <el-table-column align="center" label="默认价格" min-width="30">
        <template #default="{ row }">
          {{ row.skuPrice }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="用户价格" min-width="30">
        <template #default="{ row }">
          <el-input-number
            v-model="row.userPrice"
            :min="0"
            :precision="2"
            :step="0.1"
            class="w-60%!"
            controls-position="right"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="15" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            :disabled="saveLoading"
            :loading="saveLoading"
            @click="handleSaveUserPrice(scope.row)"
            v-hasPermi="['member:user:update']"
          >
            保存
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
    <div class="clear-both"></div>
  </Dialog>
</template>
<script lang="ts" setup>
import * as UserPriceApi from '@/api/mall/product/userPrice'
import { UserPricePageVO } from '@/api/mall/product/userPrice'
import { convertToInteger, floatToFixed2 } from '@/utils'

defineOptions({ name: 'MemberUserPriceForm' })

const message = useMessage() // 消息弹窗
const total = ref(0) // 列表的总页数
const list = ref<any[]>([]) // 列表的数据
const loading = ref(false) // 列表的加载中
const saveLoading = ref(false) // 发送按钮的加载中
const dialogVisible = ref(false) // 弹窗的是否展示
const queryParams = ref({
  pageNo: 1,
  pageSize: 10,
  userId: 0,
  brandId: 1,
  name: null,
  existsUserPrice: false
}) // 查询参数
const queryFormRef = ref() // 搜索的表单
const selectedIds = ref<number[]>([]) // 表格的选中 ID 数组

/** 打开弹窗 */
const open = (id: number) => {
  queryParams.value.userId = id
  // 打开时查询，防止发送列表剩余数量未更新的问题
  handleQuery()

  dialogVisible.value = true
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

const formatLensRange = (value: any) => {
  return `柱镜:${value.minSph.toFixed(2)}-${value.maxSph.toFixed(2)}
  , 球镜:${value.minCyl.toFixed(2)}-${value.maxCyl.toFixed(2)}
  , 下加光:${value.minAdd.toFixed(2)}-${value.maxAdd.toFixed(2)}`
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await UserPriceApi.getSkuPricePage(queryParams.value)
    data.list.forEach((item: UserPricePageVO) => {
      item.skuPrice = floatToFixed2(item.skuPrice)
      if (item.userPrice) {
        item.userPrice = floatToFixed2(item.userPrice)
      } else {
        item.userPrice = item.skuPrice
      }
      if (item.skuLens) {
        item.skuName = formatLensRange(item.skuLens)
      }
    })
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 表格选中事件 */
const handleSelectionChange = (rows: UserPriceApi.UserPricePageVO[]) => {
  selectedIds.value = rows.filter((row) => row.id).map((row) => row.id)
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryParams.value.name = null
  handleQuery()
}

/** 重置用户价格按钮操作 */
const resetUserPrice = () => {
  try {
    saveLoading.value = true
    UserPriceApi.resetUserPrice(selectedIds.value.map((i) => ({ id: i })))
    // 提示
    message.success('重置成功')
  } finally {
    saveLoading.value = false
    getList()
  }
}

/** 重置所有 */
const resetAll = () => {
  try {
    saveLoading.value = true
    UserPriceApi.resetAll(queryParams.value.userId)
    // 提示
    message.success('重置成功')
  } finally {
    saveLoading.value = false
    getList()
  }
}

/** 发送操作 **/
const handleSaveUserPrice = async (row: UserPricePageVO) => {
  try {
    saveLoading.value = true
    await UserPriceApi.saveUserPrice([
      {
        id: row.id,
        skuId: row.skuId,
        userId: queryParams.value.userId!,
        price: convertToInteger(row.userPrice)
      }
    ])
    // 提示
    message.success('保存成功')
  } finally {
    saveLoading.value = false
    await getList()
  }
}
</script>
