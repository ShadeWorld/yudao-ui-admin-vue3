<template>
  <doc-alert title="【交易】交易订单" url="https://doc.iocoder.cn/mall/trade-order/" />
  <doc-alert title="【交易】购物车" url="https://doc.iocoder.cn/mall/trade-cart/" />

  <!-- 搜索 -->
  <ContentWrap>
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="68px"
    >
      <el-row>
        <el-form-item label="订单状态" prop="status">
          <el-select v-model="queryParams.status" class="!w-280px" clearable placeholder="全部">
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.TRADE_ORDER_STATUS)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="支付方式" prop="payChannelCode">
          <el-select
            v-model="queryParams.payChannelCode"
            class="!w-280px"
            clearable
            placeholder="全部"
          >
            <el-option
              v-for="dict in getStrDictOptions(DICT_TYPE.PAY_CHANNEL_CODE)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间" prop="createTime">
          <el-date-picker
            v-model="queryParams.createTime"
            :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
            class="!w-280px"
            end-placeholder="自定义时间"
            start-placeholder="自定义时间"
            type="daterange"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="订单来源" prop="terminal">
          <el-select
            v-model="queryParams.orderSource"
            class="!w-280px"
            clearable
            placeholder="全部"
          >
            <el-option
              v-for="dict in getIntDictOptions(DICT_TYPE.TRADE_ORDER_SOURCE)"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <!--      <el-form-item label="订单类型" prop="type">-->
        <!--        <el-select v-model="queryParams.type" class="!w-280px" clearable placeholder="全部">-->
        <!--          <el-option-->
        <!--            v-for="dict in getIntDictOptions(DICT_TYPE.TRADE_ORDER_TYPE)"-->
        <!--            :key="dict.value"-->
        <!--            :label="dict.label"-->
        <!--            :value="dict.value"-->
        <!--          />-->
        <!--        </el-select>-->
        <!--      </el-form-item>-->
        <!--      <el-form-item-->
        <!--        v-if="queryParams.deliveryType === DeliveryTypeEnum.EXPRESS.type"-->
        <!--        label="快递公司"-->
        <!--        prop="logisticsId"-->
        <!--      >-->
        <!--        <el-select v-model="queryParams.logisticsId" class="!w-280px" clearable placeholder="全部">-->
        <!--          <el-option-->
        <!--            v-for="item in deliveryExpressList"-->
        <!--            :key="item.id"-->
        <!--            :label="item.name"-->
        <!--            :value="item.id"-->
        <!--          />-->
        <!--        </el-select>-->
        <!--      </el-form-item>-->
        <el-form-item label="聚合搜索">
          <el-input
            v-show="true"
            v-model="queryParams[queryType.queryParam]"
            :type="queryType.queryParam === 'userId' ? 'number' : 'text'"
            class="!w-280px"
            clearable
            placeholder="请输入"
          >
            <template #prepend>
              <el-select
                v-model="queryType.queryParam"
                class="!w-110px"
                clearable
                placeholder="全部"
                @change="inputChangeSelect"
              >
                <el-option
                  v-for="dict in dynamicSearchList"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </template>
          </el-input>
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
          <el-button @click="createOrder" type="primary" plain>
            <Icon class="mr-5px" icon="ep:plus" />
            添加订单
          </el-button>
        </el-form-item>
      </el-row>
      <el-form-item>
        <el-button
          @click="() => printShipRef.open(currentRow)"
          type="primary"
          plain
          :disabled="!currentRow"
        >
          <Icon class="mr-5px" icon="ep:printer" />
          打印配货单
        </el-button>
        <el-button
          @click="() => printTagRef.open(currentRow)"
          type="primary"
          plain
          :disabled="!currentRow"
        >
          <Icon class="mr-5px" icon="ep:printer" />
          打印标签
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <!-- 添加 row-key="id" 解决列数据中的 table#header 数据不刷新的问题  -->
    <el-table
      ref="orderTableRef"
      v-loading="loading"
      :data="list"
      row-key="id"
      show-overflow-tooltip
      highlight-current-row
      @row-click="handleRowClick"
    >
      <el-table-column prop="no" label="订单号" min-width="60" />
      <el-table-column prop="payPrice" label="实际支付" min-width="40">
        <template #default="{ row }">
          {{ floatToFixed2(row.payPrice) + '元' }}
        </template>
      </el-table-column>
      <el-table-column label="订单状态" min-width="50">
        <template #default="{ row }">
          <dict-tag :type="DICT_TYPE.TRADE_ORDER_STATUS" :value="row.status!" />
          <!--          <dict-tag :type="DICT_TYPE.TRADE_ORDER_TYPE" :value="row.type" />-->
        </template>
      </el-table-column>
      <el-table-column label="订单来源" min-width="50">
        <template #default="{ row }">
          <dict-tag :type="DICT_TYPE.TRADE_ORDER_SOURCE" :value="row.orderSource" />
        </template>
      </el-table-column>
      <el-table-column label="支付方式" min-width="50">
        <template #default="{ row }">
          <dict-tag
            v-if="row.payChannelCode"
            :type="DICT_TYPE.PAY_CHANNEL_CODE"
            :value="row.payChannelCode"
            class="mr-20px"
          />
        </template>
      </el-table-column>
      <el-table-column label="支付时间" min-width="68">
        <template #default="{ row }">
          <span v-if="row.payTime" class="mr-20px"> {{ formatDate(row.payTime) }} </span>
        </template>
      </el-table-column>
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="创建时间"
        prop="createTime"
        width="180"
      />
      <el-table-column label="收货信息" min-width="200">
        <template #default="{ row }">
          <!-- 快递发货  -->
          <div class="flex flex-col">
            <span>
              {{ row.receiverName }} {{ row.receiverMobile }} {{ row.receiverAreaName }}
              {{ row.receiverDetailAddress }}
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <div class="flex items-center">
            <el-button
              v-hasPermi="['trade:order:query']"
              link
              type="primary"
              @click="openDetail(row.id)"
            >
              <Icon icon="ep:notification" />
              详情
            </el-button>
            <el-dropdown
              v-hasPermi="['trade:order:update']"
              @command="(command) => handleCommand(command, row)"
            >
              <el-button link type="primary">
                <Icon icon="ep:d-arrow-right" />
                更多
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <!-- 如果是【快递】，并且【未发货】，则展示【发货】按钮 -->
                  <el-dropdown-item
                    v-if="row.status === TradeOrderStatusEnum.UNDELIVERED.status"
                    command="delivery"
                  >
                    <Icon icon="ep:takeaway-box" />
                    发货
                  </el-dropdown-item>
                  <template v-if="row.status === TradeOrderStatusEnum.UNPAID.status">
                    <el-dropdown-item command="editProduct">
                      <Icon icon="ep:edit" />
                      编辑商品
                    </el-dropdown-item>
                    <el-dropdown-item command="payOrder">
                      <Icon icon="ep:money" />
                      支付订单
                    </el-dropdown-item>
                  </template>
                  <el-dropdown-item command="remark">
                    <Icon icon="ep:chat-line-square" />
                    备注
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
      <!--      <OrderTableColumn :list="list">123 </OrderTableColumn>-->
    </el-table>
    <!-- 分页 -->
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 各种操作的弹窗 -->
  <OrderDeliveryForm ref="deliveryFormRef" @success="getList" />
  <OrderUpdateRemarkForm ref="updateRemarkForm" @success="getList" />
  <PrintShipList ref="printShipRef" />
  <PrintTagList ref="printTagRef" />
</template>

<script lang="ts" setup>
import type { FormInstance } from 'element-plus'
import OrderDeliveryForm from '@/views/mall/trade/order/form/OrderDeliveryForm.vue'
import OrderUpdateRemarkForm from '@/views/mall/trade/order/form/OrderUpdateRemarkForm.vue'
import * as TradeOrderApi from '@/api/mall/trade/order'
import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict'
import * as DeliveryExpressApi from '@/api/mall/trade/delivery/express'
import { PayChannelEnum, PayOrderStatusEnum, TradeOrderStatusEnum } from '@/utils/constants'
import { PrintShipList, PrintTagList } from './components'
import { floatToFixed2 } from '@/utils'
import { dateFormatter, formatDate } from '@/utils/formatTime'
import * as PayOrderApi from '@/api/pay/order'
import { Message as message } from '@/layout/components/Message'

defineOptions({ name: 'TradeOrder' })

const { currentRoute, push } = useRouter() // 路由跳转
const loading = ref(true) // 列表的加载中
const total = ref(2) // 列表的总页数
const list = ref<TradeOrderApi.OrderVO[]>([]) // 列表的数据
const queryFormRef = ref<FormInstance>() // 搜索的表单
const orderTableRef = ref()
// 表单搜索
const queryParams = ref({
  pageNo: 1, // 页数
  pageSize: 10, // 每页显示数量
  status: undefined, // 订单状态
  payChannelCode: undefined, // 支付方式
  createTime: undefined, // 创建时间
  orderSource: undefined, // 订单来源
  type: undefined, // 订单类型
  deliveryTemplateId: undefined // 快递公司
})
const queryType = reactive({ queryParam: '' }) // 订单搜索类型 queryParam

// 订单聚合搜索 select 类型配置（动态搜索）
const dynamicSearchList = ref([
  { value: 'no', label: '订单号' },
  { value: 'userId', label: '用户UID' },
  { value: 'userNickname', label: '用户昵称' },
  { value: 'userMobile', label: '用户电话' }
])
/**
 * 聚合搜索切换查询对象时触发
 * @param val
 */
const inputChangeSelect = (val: string) => {
  dynamicSearchList.value
    .filter((item) => item.value !== val)
    ?.forEach((item1) => {
      // 清除集合搜索无用属性
      if (queryParams.value.hasOwnProperty(item1.value)) {
        delete queryParams.value[item1.value]
      }
    })
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await TradeOrderApi.getOrderPage(unref(queryParams))
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = async () => {
  queryParams.value.pageNo = 1
  await getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  queryParams.value = {
    pageNo: 1, // 页数
    pageSize: 10, // 每页显示数量
    status: undefined, // 订单状态
    payChannelCode: undefined, // 支付方式
    createTime: undefined, // 创建时间
    orderSource: undefined, // 订单来源
    type: undefined, // 订单类型
    deliveryTemplateId: undefined // 快递公司
  }
  handleQuery()
}

/** 查看订单详情 */
const openDetail = (id: number) => {
  push({ name: 'TradeOrderDetail', params: { id } })
}

/** 创建订单 */
const createOrder = () => {
  push({ name: 'TradeOrderAdd' })
}

/** 操作分发 */
const deliveryFormRef = ref()
const updateRemarkForm = ref()
const handleCommand = (command: string, row: TradeOrderApi.OrderVO) => {
  switch (command) {
    case 'remark':
      updateRemarkForm.value?.open(row)
      break
    case 'delivery':
      deliveryFormRef.value?.open(row)
      break
    case 'payOrder':
      payOrder(row.payOrderId)
      break
    case 'editProduct':
      push({ name: 'TradeOrderEditProduct', params: { id: row.id } })
      break
  }
}

// 监听路由变化更新列表，解决订单保存/更新后，列表不刷新的问题。
watch(
  () => currentRoute.value,
  () => {
    getList()
  }
)

const deliveryExpressList = ref<DeliveryExpressApi.DeliveryExpressVO[]>([]) // 物流公司
/** 初始化 **/
onMounted(async () => {
  await getList()
  deliveryExpressList.value = await DeliveryExpressApi.getSimpleDeliveryExpressList()
})

// 当前选中行
const currentRow = ref<TradeOrderApi.OrderVO>()

const handleRowClick = (row) => {
  if (row === currentRow.value) {
    orderTableRef.value.setCurrentRow()
    currentRow.value = undefined
  } else {
    orderTableRef.value.setCurrentRow(row)
    currentRow.value = row
  }
}

const payOrder = async (id) => {
  try {
    const formData = {
      id: id,
      channelCode: PayChannelEnum.MOCK.code
    }
    const data = await PayOrderApi.submitOrder(formData)
    // 直接返回已支付的情况，例如说扫码支付
    if (data.status === PayOrderStatusEnum.SUCCESS.status) {
      message.success('支付成功！')
      await getList()
      return
    }
  } finally {
  }
}

// 打印配货单弹窗
const printShipRef = ref()
// 打印标签弹窗
const printTagRef = ref()
</script>
