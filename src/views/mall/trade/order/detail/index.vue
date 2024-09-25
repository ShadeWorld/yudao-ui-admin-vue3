<template>
  <ContentWrap>
    <!-- 订单信息 -->
    <el-descriptions title="订单信息">
      <el-descriptions-item label="订单号: ">{{ formData.no }}</el-descriptions-item>
      <el-descriptions-item label="买家: ">{{ formData?.user?.nickname }}</el-descriptions-item>
      <el-descriptions-item label="订单类型: ">
        <dict-tag :type="DICT_TYPE.TRADE_ORDER_TYPE" :value="formData.type!" />
      </el-descriptions-item>
      <el-descriptions-item label="订单来源: ">
        <dict-tag :type="DICT_TYPE.TRADE_ORDER_SOURCE" :value="formData.orderSource!" />
      </el-descriptions-item>
      <el-descriptions-item label="买家留言: ">{{ formData.userRemark }}</el-descriptions-item>
      <el-descriptions-item label="商家备注: ">{{ formData.remark }}</el-descriptions-item>
      <el-descriptions-item label="支付单号: ">{{ formData.payOrderId }}</el-descriptions-item>
      <el-descriptions-item label="付款方式: ">
        <dict-tag :type="DICT_TYPE.PAY_CHANNEL_CODE" :value="formData.payChannelCode!" />
      </el-descriptions-item>
    </el-descriptions>

    <!-- 订单状态 -->
    <el-descriptions :column="1" title="订单状态">
      <el-descriptions-item label="订单状态: ">
        <dict-tag :type="DICT_TYPE.TRADE_ORDER_STATUS" :value="formData.status!" />
      </el-descriptions-item>
      <el-descriptions-item v-hasPermi="['trade:order:update']" label-class-name="no-colon">
        <el-button v-if="formData.status! === TradeOrderStatusEnum.UNPAID.status" type="primary" @click="updatePrice">
          调整价格
        </el-button>
        <el-button
          v-if="formData.status! === TradeOrderStatusEnum.UNDELIVERED.status"
          type="primary"
          @click="terminateOrder(id)"
        >
          终止订单
        </el-button>
        <el-button type="primary" @click="remark">备注</el-button>
        <!-- 待发货 -->
        <template v-if="formData.status! === TradeOrderStatusEnum.UNDELIVERED.status">
          <!-- 快递发货 -->
          <el-button v-if="formData.deliveryType === DeliveryTypeEnum.EXPRESS.type" type="primary" @click="delivery">
            发货
          </el-button>
          <el-button type="primary" @click="updateAddress"> 修改地址</el-button>
        </template>
      </el-descriptions-item>
    </el-descriptions>

    <!-- 商品信息 -->
    <el-descriptions title="商品信息">
      <el-descriptions-item labelClassName="no-colon">
        <el-row :gutter="20">
          <el-col :span="15">
            <div class="flex gap-2 mb-10px">
              <el-tag type="primary" v-for="craft in formData.craftList" :key="craft.id">
                {{ `${craft.craftName} ${fenToYuan(craft.price)}元` }}
              </el-tag>
              <el-tag type="success" v-if="formData.mainOrderId"> 加单免运费 </el-tag>
            </div>
            <el-table :data="formData.items" border>
              <el-table-column label="商品" prop="spuName" width="auto">
                <template #default="{ row }">
                  {{ row.spuName }}
                  <el-tag v-for="property in row.properties" :key="property.propertyId">
                    {{ property.propertyName }}: {{ property.valueName }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="商品原价" prop="price" width="150">
                <template #default="{ row }">{{ fenToYuan(row.price) }}元</template>
              </el-table-column>
              <el-table-column label="数量" prop="count" width="100" />
              <el-table-column label="合计" prop="payPrice" width="150">
                <template #default="{ row }">{{ fenToYuan(row.payPrice) }}元</template>
              </el-table-column>
              <el-table-column label="售后状态" prop="afterSaleStatus" width="120">
                <template #default="{ row }">
                  <dict-tag :type="DICT_TYPE.TRADE_ORDER_ITEM_AFTER_SALE_STATUS" :value="row.afterSaleStatus" />
                </template>
              </el-table-column>
              <el-table-column align="center" fixed="right" label="操作" width="80">
                <template #default="{ row }">
                  <el-button link type="primary" @click="openDetail(row)">
                    <Icon icon="ep:notification" />
                    详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
          <el-col :span="10" />
        </el-row>
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions :column="4">
      <!-- 第一层 -->
      <el-descriptions-item label="商品总额: "> {{ fenToYuan(formData.totalPrice!) }} 元 </el-descriptions-item>
      <el-descriptions-item label="工艺金额: "> {{ fenToYuan(formData.craftPrice!) }} 元 </el-descriptions-item>
      <el-descriptions-item label="运费金额: "> {{ fenToYuan(formData.deliveryPrice!) }} 元 </el-descriptions-item>
      <el-descriptions-item label="订单调价: "> {{ fenToYuan(formData.adjustPrice!) }} 元 </el-descriptions-item>
      <!--      <el-descriptions-item v-for="item in 1" :key="item" label-class-name="no-colon" />-->
      <!-- 第二层 -->
      <el-descriptions-item>
        <template #label><span style="color: red">优惠劵优惠: </span></template>
        {{ fenToYuan(formData.couponPrice!) }} 元
      </el-descriptions-item>
      <!-- 第三层 -->
      <el-descriptions-item v-for="item in 3" :key="item" label-class-name="no-colon" />
      <el-descriptions-item label="应付金额: "> {{ fenToYuan(formData.payPrice!) }} 元 </el-descriptions-item>
    </el-descriptions>

    <!-- 物流信息 -->
    <el-descriptions :column="4" title="收货信息">
      <el-descriptions-item label="配送方式: ">
        {{ formData.deliveryTemplateName }}
      </el-descriptions-item>
      <el-descriptions-item label="收货人: ">{{ formData.receiverName }}</el-descriptions-item>
      <el-descriptions-item label="联系电话: ">{{ formData.receiverMobile }}</el-descriptions-item>
      <!-- 快递配送 -->
      <el-descriptions-item v-if="formData.receiverDetailAddress" label="收货地址: ">
        {{ formData.receiverAreaName }} {{ formData.receiverDetailAddress }}
        <el-link
          v-clipboard:copy="formData.receiverAreaName + ' ' + formData.receiverDetailAddress"
          v-clipboard:success="clipboardSuccess"
          icon="ep:document-copy"
          type="primary"
        />
      </el-descriptions-item>
      <!--      <el-descriptions-item v-if="formData.logisticsNo" label="运单号: ">-->
      <!--        {{ formData.logisticsNo }}-->
      <!--      </el-descriptions-item>-->
      <!--      <el-descriptions-item v-if="formatDate.deliveryTime" label="发货时间: ">-->
      <!--        {{ formatDate(formData.deliveryTime) }}-->
      <!--      </el-descriptions-item>-->
      <el-descriptions-item v-for="item in 2" :key="item" label-class-name="no-colon" />
      <!--      <el-descriptions-item v-if="expressTrackList.length > 0" label="物流详情: ">-->
      <!--        <el-timeline>-->
      <!--          <el-timeline-item-->
      <!--            v-for="(express, index) in expressTrackList"-->
      <!--            :key="index"-->
      <!--            :timestamp="formatDate(express.time)"-->
      <!--          >-->
      <!--            {{ express.content }}-->
      <!--          </el-timeline-item>-->
      <!--        </el-timeline>-->
      <!--      </el-descriptions-item>-->
    </el-descriptions>

    <!-- 订单日志 -->
    <el-descriptions title="订单操作日志">
      <el-descriptions-item labelClassName="no-colon">
        <el-timeline>
          <el-timeline-item
            v-for="(log, index) in formData.logs"
            :key="index"
            :timestamp="formatDate(log.createTime!)"
            placement="top"
          >
            <div class="el-timeline-right-content">
              {{ log.content }}
            </div>
            <template #dot>
              <span :style="{ backgroundColor: getUserTypeColor(log.userType!) }" class="dot-node-style">
                {{ getDictLabel(DICT_TYPE.USER_TYPE, log.userType)[0] }}
              </span>
            </template>
          </el-timeline-item>
        </el-timeline>
      </el-descriptions-item>
    </el-descriptions>
  </ContentWrap>

  <!-- 各种操作的弹窗 -->
  <OrderDeliveryForm ref="deliveryFormRef" @success="getDetail" />
  <OrderUpdateRemarkForm ref="updateRemarkForm" @success="getDetail" />
  <OrderUpdateAddressForm ref="updateAddressFormRef" @success="getDetail" />
  <OrderUpdatePriceForm ref="updatePriceFormRef" @success="getDetail" />
  <ElDialog
    v-model="dialogVisible"
    title="详情"
    :width="detailWidth"
    destroy-on-close
    center
    maxHeight="980px"
    class="lens-dialog"
    v-if="currentDetailItem"
  >
    <el-row justify="center">
      <SingleSelectLens
        v-model="lensList"
        v-if="isSingleSelect"
        :process-choose="formData.type == TradeOrderTypeEnum.PROCESS"
        :is-detail="true"
      />
      <BatchSelectLens v-model="rows" v-if="!isSingleSelect" :is-detail="true" />
    </el-row>
  </ElDialog>
</template>
<script lang="ts" setup>
import * as TradeOrderApi from '@/api/mall/trade/order'
import { OrderItemLens, OrderItemRespVO } from '@/api/mall/trade/order'
import { fenToYuan } from '@/utils'
import { formatDate } from '@/utils/formatTime'
import { DICT_TYPE, getDictLabel, getDictObj } from '@/utils/dict'
import OrderUpdateRemarkForm from '@/views/mall/trade/order/form/OrderUpdateRemarkForm.vue'
import OrderDeliveryForm from '@/views/mall/trade/order/form/OrderDeliveryForm.vue'
import OrderUpdateAddressForm from '@/views/mall/trade/order/form/OrderUpdateAddressForm.vue'
import OrderUpdatePriceForm from '@/views/mall/trade/order/form/OrderUpdatePriceForm.vue'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { DeliveryTypeEnum, TradeOrderStatusEnum, TradeOrderTypeEnum } from '@/utils/constants'
import { propTypes } from '@/utils/propTypes'
import { BatchSelectLens } from '@/views/mall/trade/order/components'
import SingleSelectLens from '../components/SingleSelectLens.vue'
import { OrderLens } from '@/views/mall/trade/order/components/SingleSelectLens.vue'
import { Row } from '@/views/mall/trade/order/components/BatchSelectLens.vue'

defineOptions({ name: 'TradeOrderDetail' })

const message = useMessage() // 消息弹窗

/** 获得 userType 颜色 */
const getUserTypeColor = (type: number) => {
  const dict = getDictObj(DICT_TYPE.USER_TYPE, type)
  switch (dict?.colorType) {
    case 'success':
      return '#67C23A'
    case 'info':
      return '#909399'
    case 'warning':
      return '#E6A23C'
    case 'danger':
      return '#F56C6C'
  }
  return '#409EFF'
}

// 订单详情
const formData = ref<TradeOrderApi.OrderVO>({
  logs: []
})

const isLensProduct = computed(
  () => currentDetailItem.value?.categoryId === 1 || currentDetailItem.value?.categoryId === 2
)

const isSingleSelect = computed(
  () =>
    currentDetailItem.value?.categoryId === 2 ||
    currentDetailItem.value?.orderLensList.find((i) => i.leftOrRight) ||
    formData.value.type === TradeOrderTypeEnum.PROCESS
)

/** 各种操作 */
const updateRemarkForm = ref() // 订单备注表单 Ref
const remark = () => {
  updateRemarkForm.value?.open(formData.value)
}
const deliveryFormRef = ref() // 发货表单 Ref
const delivery = () => {
  deliveryFormRef.value?.open(formData.value)
}
const updateAddressFormRef = ref() // 收货地址表单 Ref
const updateAddress = () => {
  updateAddressFormRef.value?.open(formData.value)
}
const updatePriceFormRef = ref() // 订单调价表单 Ref
const updatePrice = () => {
  updatePriceFormRef.value?.open(formData.value)
}

const terminateOrder = async (id: number) => {
  try {
    await TradeOrderApi.terminateOrder(id)
    message.success('终止成功！')
    await getDetail()
  } finally {
  }
}

/** 获得详情 */
const { params } = useRoute() // 查询参数
const props = defineProps({
  id: propTypes.number.def(undefined), // 订单ID
  showPickUp: propTypes.bool.def(true) // 显示核销按钮
})
const id = (params.id || props.id) as unknown as number
const getDetail = async () => {
  if (id) {
    const res = (await TradeOrderApi.getOrder(id)) as TradeOrderApi.OrderVO
    // 没有表单信息则关闭页面返回
    if (!res) {
      message.error('交易订单不存在')
      close()
    }
    formData.value = res
  }
}

/** 关闭 tag */
const { delView } = useTagsViewStore() // 视图操作
const { push, currentRoute } = useRouter() // 路由
const close = () => {
  delView(unref(currentRoute))
  push({ name: 'TradeOrder' })
}

/** 复制 */
const clipboardSuccess = () => {
  message.success('复制成功')
}

/** 初始化 **/
const expressTrackList = ref([]) // 物流详情
const pickUpStore = ref({}) // 自提门店
onMounted(async () => {
  await getDetail()
  if (formData.value.logisticsId) {
    expressTrackList.value = await TradeOrderApi.getExpressTrackList(formData.value.id!)
  }
})

// 详情dialog是否展示
const dialogVisible = ref(false)
// 当前详情展示spu
const currentDetailItem = ref<OrderItemRespVO>()
// Dialog宽度
const detailWidth = ref<number>(800)

/**
 * 展示已选镜片的详情
 * @param detailItem
 */
const openDetail = (detailItem: OrderItemRespVO) => {
  currentDetailItem.value = detailItem
  if (isLensProduct.value) {
    // 镜片详情处理
    if (isSingleSelect.value) {
      singleLensDetail()
    } else {
      batchLensDetail()
    }
  }
  dialogVisible.value = true
}

// 批量选择镜片的所有行
const rows = ref<Row[]>([])
const batchLensDetail = () => {
  rows.value.splice(0, rows.value.length)
  let minCyl: number = currentDetailItem.value?.orderLensList[0].cyl
  let maxCyl: number = minCyl
  currentDetailItem.value?.orderLensList.forEach((orderLens: OrderItemLens) => {
    // 生成批量选择控件的所有行
    let row = rows.value.find((i) => orderLens.sph === i.sph)
    if (row) {
      row.cols.push({
        row: row,
        cyl: orderLens.cyl,
        add: orderLens.add,
        count: orderLens.count,
        selected: false
      })
    } else {
      row = {
        sph: orderLens.sph,
        cols: []
      }
      row.cols.push({
        row: row,
        cyl: orderLens.cyl,
        add: orderLens.add,
        count: orderLens.count,
        selected: false
      })
      rows.value.push(row)
    }
    // 计算最大cyl和最小cyl，用于计算dialog宽度
    minCyl = Math.min(minCyl, orderLens.cyl)
    maxCyl = Math.max(maxCyl, orderLens.cyl)
  })
  detailWidth.value = ((maxCyl - minCyl) / 0.25 + 1) * 51 + 100
}

// 单独选择镜片的所有行
const lensList = ref<OrderLens[]>([])
const singleLensDetail = () => {
  lensList.value.splice(0, lensList.value.length)
  detailWidth.value = 1000
  currentDetailItem.value?.orderLensList.forEach((item: OrderItemLens) => {
    // 回显
    const orderLens: OrderLens = {
      sph: item.sph,
      cyl: item.cyl,
      add: item.add,
      leftOrRight: item.leftOrRight,
      axis: item.axis,
      prism: item.prism,
      pd: item.pd,
      ph: item.ph,
      count: item.count
    }
    lensList.value.push(orderLens)
  })
}
</script>
<style lang="scss" scoped>
:deep(.el-descriptions) {
  &:not(:nth-child(1)) {
    margin-top: 20px;
  }

  .el-descriptions__title {
    display: flex;
    align-items: center;

    &::before {
      display: inline-block;
      width: 3px;
      height: 20px;
      margin-right: 10px;
      background-color: #409eff;
      content: '';
    }
  }

  .el-descriptions-item__container {
    margin: 0 10px;

    .no-colon {
      margin: 0;

      &::after {
        content: '';
      }
    }
  }
}

// 时间线样式调整
:deep(.el-timeline) {
  margin: 10px 0 0 160px;

  .el-timeline-item__wrapper {
    position: relative;
    top: -20px;

    .el-timeline-item__timestamp {
      position: absolute !important;
      top: 10px;
      left: -150px;
    }
  }

  .el-timeline-right-content {
    display: flex;
    align-items: center;
    min-height: 30px;
    padding: 10px;
    background-color: #f7f8fa;

    &::before {
      position: absolute;
      top: 10px;
      left: 13px; /* 将伪元素水平居中 */
      border-color: transparent #f7f8fa transparent transparent; /* 尖角颜色，左侧朝向 */
      border-style: solid;
      border-width: 8px; /* 调整尖角大小 */
      content: ''; /* 必须设置 content 属性 */
    }
  }

  .dot-node-style {
    position: absolute;
    left: -5px;
    display: flex;
    width: 20px;
    height: 20px;
    font-size: 10px;
    color: #fff;
    border-radius: 50%;
    justify-content: center;
    align-items: center;
  }
}
</style>
