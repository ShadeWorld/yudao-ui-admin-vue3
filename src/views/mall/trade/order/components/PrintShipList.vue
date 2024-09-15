<script setup lang="ts">
import { getPrintDetail, OrderVO, updatePrintStatus } from '@/api/mall/trade/order'
import { formatDegree } from '@/utils/lens'

defineOptions({ name: 'PrintShipList' })
const dialogVisible = ref(false) // 弹窗的是否展示

const orderPrintDetail = ref<any>()

let id: number | undefined = undefined

const open = async (orderVo: OrderVO) => {
  id = orderVo.id!
  orderPrintDetail.value = await getPrintDetail(orderVo.id!, orderVo.no!, 1)
  orderPrintDetail.value.createTime = orderVo.createTime
  dialogVisible.value = true
}
defineExpose({ open })

/**
 * 打印备货单
 */
const printShip = () => {
  dialogVisible.value = false
  updatePrintStatus(id!, 1)
  const dom = document.querySelector(`[class="print-ship-wrap"]`)
  // debugger;
  const html = dom?.outerHTML
  // about:blank
  const newBlankWindow = window.open('', '_blank')
  const style = `
<style type="text/css">
    @page {
        margin: 0;
        size: portrait;
    }
    @media print {
        .first-tr {
            font-size: 21px;
        }
        .print-item-header {
            border-top: 1px solid #000;
            margin: 5px 0;
        }
        .print-item-header:after {
            clear: both;
            display: table;
            content: '';
        }
        table {
            clear: both;
            table-layout: auto;
            border-collapse: collapse;
            border: 1px solid #000000;
            font-size: 18px;
        }
        .tr-border td {
            border: 1px solid #000000;
            padding: 2px 0;
            text-align: center;
        }
        .fl {
            float: left;
        }
        .fr {
            float: right;
        }
        .print-ship-footer {
            margin-top: 10px;
            border-top: 1px solid #000000;
        }
        .print-ship-wrap {
            margin: 0mm 2mm;
        }
    }
</style>`
  const qrcodeScript = document.createElement('script')
  if (import.meta.env.VITE_DEV === 'true') {
    qrcodeScript.src = '/src/assets/js/qrcode.js'
  } else {
    qrcodeScript.src = 'https://zhaomingyanjing.store/glass-manage/qrcode.js'
  }
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.innerHTML = `
  document.querySelectorAll('.qrcode').forEach(function (e) {
    new QRCode(e, {
            text: e.getAttribute('data-qrcode'),
            width: e.getAttribute('data-size'),
            height: e.getAttribute('data-size')
    });
  })
  window.print()
  window.close()
`

  newBlankWindow?.document.write(qrcodeScript.outerHTML + style + html! + script.outerHTML)
  newBlankWindow?.document.close()
}

const cancel = () => {
  dialogVisible.value = false
}

const formatCraftList = (craftList) => {}
</script>

<template>
  <Dialog v-model="dialogVisible" title="配货单打印" width="25%" class="print-dialog">
    <el-row justify="center">
      请确认是否打印该订单的配货单？
      <div class="print-ship-wrap" id="print-wrap">
        <div class="print-ship-header">
          <div class="fl">{{ `备注：${orderPrintDetail.remark ? orderPrintDetail.remark : ''}` }}</div>
          <div class="qrcode fr" data-size="70" :data-qrcode="orderPrintDetail.no"></div>
          <div style="clear: both">
            <table style="border: none; padding-top: 5px; margin-top: 5px; width: 100%">
              <tr>
                <td>单号：{{ orderPrintDetail.no }}</td>
                <td>联系人：{{ orderPrintDetail.receiverName }}</td>
              </tr>
              <tr>
                <td colspan="2">
                  地址：{{ orderPrintDetail.receiverAreaName + orderPrintDetail.receiverDetailAddress }}
                </td>
              </tr>
            </table>
          </div>
        </div>
        <div v-for="item in orderPrintDetail.spuItems" :key="item.id">
          <div class="print-item-header">
            <div style="float: left">产品：{{ item.spuName }}</div>
            <div style="float: right">{{ item.categoryId === 1 ? '镜片' : '车房' }}</div>
          </div>
          <table style="width: 100%">
            <tr class="tr-border">
              <td style="min-width: 50px"></td>
              <td style="min-width: 100px">球镜</td>
              <td style="min-width: 100px">柱镜</td>
              <td style="min-width: 100px">加光</td>
              <td style="min-width: 50px">轴位</td>
              <td style="min-width: 50px">数量</td>
            </tr>
            <tr v-for="lensItem in item.lensItems" :key="lensItem.orderItemId" class="tr-border">
              <td>{{ lensItem.leftOrRight ? (lensItem.leftOrRight === 1 ? 'L' : 'R') : '' }}</td>
              <td>{{ formatDegree(lensItem.sph) }}</td>
              <td>{{ formatDegree(lensItem.cyl) }}</td>
              <td>{{ formatDegree(lensItem.add) }}</td>
              <td>{{ lensItem['axis'] }}</td>
              <td>{{ lensItem.count }}</td>
            </tr>
          </table>
        </div>
        <div class="print-ship-footer">
          <table style="border: none; width: 100%">
            <tr>
              <td>发货方式：{{ orderPrintDetail.deliveryTemplate }}</td>
              <td>{{ orderPrintDetail.receiverAreaName }}</td>
            </tr>
            <tr>
              <td colspan="2"> 总数量：{{ orderPrintDetail.count }}</td>
            </tr>
            <tr>
              <td colspan="2">
                {{ orderPrintDetail.type === 1 ? `加工订单:${orderPrintDetail.craftList.join(',')}` : '' }}</td
              >
            </tr>
          </table>
        </div>
      </div>
    </el-row>
    <template #footer>
      <el-row justify="end">
        <el-button type="primary" @click="cancel">取消</el-button>
        <el-button type="primary" @click="printShip">打印</el-button>
      </el-row>
    </template>
  </Dialog>
</template>

<style lang="scss">
.print-dialog {
  --el-dialog-bg-color: var(--app-content-bg-color);
  --el-dialog-margin-top: 20px;
}

.print-ship-wrap {
  display: none;
  position: absolute;
}
</style>
