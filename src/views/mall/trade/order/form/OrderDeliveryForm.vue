<template>
  <Dialog v-model="dialogVisible" title="订单发货" width="40%">
    <el-form ref="formRef" v-loading="formLoading" :model="formData" label-width="80px">
      <!--      <el-form-item label="发货方式">-->
      <!--        <el-radio-group v-model="expressType">-->
      <!--          <el-radio border label="express">快递物流</el-radio>-->
      <!--          <el-radio border label="none">无需发货</el-radio>-->
      <!--        </el-radio-group>-->
      <!--      </el-form-item>-->
      <el-form-item label="发货类型">
        <el-radio-group v-model="formData.sendType">
          <el-radio border :label="2">全部发货</el-radio>
          <el-radio border :label="1">部分发货</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="运费">
        <el-input-number
          v-model="formData.deliveryPrice"
          :max="formData.deliveryPrice"
          :min="0"
          :precision="0"
          :step="1"
        />
      </el-form-item>
      <el-row>
        <el-col :span="24">
          <el-form-item label="物流单号">
            <el-radio-group v-model="formData.existsLogisticsNo">
              <el-radio border :label="false">自动生成</el-radio>
              <el-radio border :label="true">手动填写</el-radio>
            </el-radio-group>
            <el-input
              v-if="formData.existsLogisticsNo"
              style="width: 240px; margin-left: 10px"
              v-model="formData.logisticsNo"
              placeholder="请输入物流单号"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item v-if="formData.sendType === 1" label="商品列表">
        <el-scrollbar height="400px" class="w-100%">
          <el-table v-loading="loading" :data="skuList" size="small" border>
            <el-table-column align="center" label="商品名称" min-width="100">
              <template #default="{ row }">
                {{ row.name }}
              </template>
            </el-table-column>
            <el-table-column align="center" label="订单数量" min-width="20">
              <template #default="{ row }">
                {{ row.count }}
              </template>
            </el-table-column>
            <el-table-column align="center" label="已发货数量" min-width="20">
              <template #default="{ row }">
                {{ row.finishCount }}
              </template>
            </el-table-column>
            <el-table-column align="center" label="发货数量" min-width="30">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.sendCount"
                  :precision="0"
                  :step="1"
                  size="small"
                  :min="0"
                  :max="row.count - row.finishCount"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-scrollbar>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { cloneDeep } from 'lodash-es'
import * as DeliveryExpressApi from '@/api/mall/trade/delivery/express'
import * as TradeOrderApi from '@/api/mall/trade/order'
import { getOrder } from '@/api/mall/trade/order'
import { copyValueToTarget } from '@/utils'
import request from '@/config/axios'

defineOptions({ name: 'OrderDeliveryForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const loading = ref(true) // 列表的加载中
const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const expressType = ref('express') // 如果值是 express，则是快递；none 则是无；未来做同城配送；
const formData = ref<TradeOrderApi.DeliveryVO>({
  existsLogisticsNo: false,
  deliveryPrice: 0,
  id: 0, // 订单编号
  sendType: 2,
  logisticsNo: '', // 物流编号
  items: []
})
// 商品集合
const skuList = ref<any>([])
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (row: TradeOrderApi.OrderVO) => {
  loading.value = false
  resetForm()
  // 设置数据
  copyValueToTarget(formData.value, row)
  formData.value.deliveryPrice = formData.value.deliveryPrice! / 100
  // 加载sku信息
  loadSkuList()
  loading.value = false
  dialogVisible.value = true
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

// 商品属性文案
function formatLensName(spuName, lens) {
  let content = '球镜:' + lens.sph.toFixed(2) + ' 柱镜:' + lens.cyl.toFixed(2) + ' 加光:' + lens.add.toFixed(2)
  if (lens.leftOrRight) {
    content += ` ${lens.leftOrRight === 1 ? '左眼' : '右眼'}`
  }
  if (lens.hasOwnProperty('axis') && Number.isFinite(lens.axis)) {
    content += ` 轴位: ${lens.axis}`
  }
  return `${spuName} ${content}`
}

/** 获取数据 */
const loadSkuList = () => {
  skuList.value.splice(0, skuList.value.length)
  if (formData.value.id) {
    getOrder(formData.value.id).then((res) => {
      // 没有表单信息则关闭页面返回
      if (!res) {
        message.error('交易订单不存在')
        close()
      }
      res.items.forEach((item: any) => {
        item.orderLensList?.forEach((lens: any) => {
          skuList.value.push({
            id: lens.id,
            name: formatLensName(item.spuName, lens),
            orderItemId: item.id,
            count: lens.count,
            finishCount: lens.finishCount,
            sendCount: 0
          })
        })
      })
    })
  }
}

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 提交请求
  formLoading.value = true
  try {
    const param = unref(formData)
    if (expressType.value === 'none') {
      // 无需发货的情况
      param.logisticsNo = ''
    }
    const sendSkuList = []
    param.items = sendSkuList

    // 合并镜片到商品项中
    const skuListParam = cloneDeep(unref(skuList))
    skuListParam.forEach((item: any) => {
      if (item.sendCount > 0 || param.sendType === 2) {
        item.finishCount = param.sendType === 2 ? item.count : item.finishCount + item.sendCount
        const existsItem = sendSkuList.find((i) => i.id === item.orderItemId)
        if (existsItem) {
          existsItem.finishCount += item.finishCount
          existsItem.orderLensList.push(item)
        } else {
          sendSkuList.push({
            id: item.orderItemId,
            finishCount: item.finishCount,
            orderLensList: [item]
          })
        }
      }
    })

    if (!sendSkuList.length) {
      message.error('请输入发货数量')
    } else {
      const { deliveryId, orderNo, logisticsNo } = await TradeOrderApi.deliveryOrder(param)
      if (deliveryId && orderNo) {
        if (!logisticsNo) {
          let orderCode = `${orderNo}-${deliveryId}`
          await request.put({ url: `/ext/redirect/to-zto`, params: { orderCode } })
        }
        // await printDelivery(deliveryId, 0)
        // 发送操作成功的事件
        message.success('发货成功')
        emit('success', true)
      } else {
        message.error('快递订单创建失败')
      }
      dialogVisible.value = false
    }
  } finally {
    formLoading.value = false
  }
}

async function printDelivery(deliveryId: number, retryCount: number) {
  setTimeout(async () => {
    let logisticsNo: any = await TradeOrderApi.printDelivery(deliveryId)
    if (logisticsNo && logisticsNo !== '') {
      message.success(t('common.updateSuccess'))
      await request.put({ url: `/ext/redirect/to-zto`, params: { logisticsNo } })
    } else {
      if (retryCount < 5) {
        await printDelivery(deliveryId, ++retryCount)
        return
      } else {
        message.error('快递单号获取失败，请手动前往快递管家打印订单')
      }
    }
    formLoading.value = false
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success', true)
  }, 600)
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    existsLogisticsNo: false,
    deliveryPrice: 0,
    id: 0, // 订单编号
    sendType: 2, // 发货类型
    logisticsNo: '' // 物流编号
  }
  formRef.value?.resetFields()
}
const deliveryExpressList = ref([])
onMounted(async () => {
  deliveryExpressList.value = await DeliveryExpressApi.getSimpleDeliveryExpressList()
})
</script>
