<script setup lang="ts">
import { getPrintDetail, OrderVO } from '@/api/mall/trade/order'
import { formatDate } from '@/utils/formatTime'
import { formatDegree } from '@/utils/lens'

defineOptions({ name: 'PrintTagList' })
const dialogVisible = ref(false) // 弹窗的是否展示

const orderPrintDetail = ref<any>()

const open = async (orderVo: OrderVO) => {
  orderPrintDetail.value = await getPrintDetail(orderVo.id!, orderVo.no!)
  orderPrintDetail.value.createTime = orderVo.createTime
  dialogVisible.value = true
}
defineExpose({ open })

// 标签 宽70mm 高60mm 间距 3mm
const printTag = () => {
  const dom = document.querySelector(`[class="print-wrap"]`)
  // debugger;
  const html = dom?.innerHTML
  // about:blank
  const newBlankWindow = window.open('', '_blank')
  const style = `
<style type="text/css">
    @page {
        margin: 0;
        size: 70mm 60mm;
    }
    @media print {
        .first-tr {
            font-size: 21px;
        }
        table {
            font-size: 18px;
        }
        .print-content-top td {
            padding-top: 2mm;
        }
        .print-content-top {
            transform: rotate(180deg);
        }
        .print-content-bottom table{
            font-size: 26px;
        }
    }
</style>`
  const qrcodeScript = document.createElement('script')
  if (import.meta.env.VITE_DEV) {
    qrcodeScript.src = '/src/assets/js/qrcode.js'
  } else {
    qrcodeScript.src = 'https://www.zhaomingyanjing.store/glass-manage/qrcode.js'
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
</script>

<template>
  <Dialog v-model="dialogVisible" title="标签打印" width="25%" class="print-dialog">
    <el-row justify="center">
      请确认是否打印该订单标签？
      <div class="print-wrap" id="print-wrap">
        <div v-for="item in orderPrintDetail.spuItems" :key="item.id">
          <div class="print-content" v-for="lensItem in item.lensItems" :key="lensItem.orderItemId">
            <div class="print-content-top">
              <table border="0" cellpadding="0" cellspacing="0" style="width: 100%">
                <tr class="first-tr">
                  <td>[折射率]ne={{ item.refractive }}</td>
                  <td colspan="2">[色散系数]Vd={{ item.abbe }}</td>
                </tr>
                <tr>
                  <td>[中心厚度]{{ lensItem.centerThickness }}mm</td>
                  <td colspan="2">[直径]Φ {{ lensItem.diameter }}mm</td>
                </tr>
                <tr>
                  <td>[颜色]{{ item.color }}</td>
                  <td>[镜片分类]眼镜类</td>
                  <td rowspan="3">
                    <div class="qrcode" data-size="70" :data-qrcode="orderPrintDetail.no"></div>
                  </td>
                </tr>
                <tr>
                  <td>[膜层情况]{{ item.filmLayer }}</td>
                  <td>[等级]合格</td>
                </tr>
                <tr>
                  <td colspan="2">[透射比分类]{{ item.transmittance }}</td>
                </tr>
                <tr>
                  <td colspan="2">执行标准：{{ item.standard }}</td>
                  <td>
                    生产日期<br />
                    {{ formatDate(orderPrintDetail.createTime, 'YYYY/MM/DD') }}
                  </td>
                </tr>
              </table>
            </div>
            <div class="print-content-bottom">
              <table border="0" cellpadding="0" cellspacing="0" style="width: 100%">
                <tr>
                  <td colspan="5">品名：{{ item.spuName }}</td>
                </tr>
                <tr>
                  <td rowspan="4">
                    <div class="qrcode" data-size="80" :data-qrcode="item.id"></div>
                  </td>
                  <td rowspan="2">S</td>
                  <td style="text-decoration: underline">{{ formatDegree(lensItem.sph) }}D</td>
                  <td rowspan="2">C</td>
                  <td style="text-decoration: underline"
                    >{{ formatDegree(lensItem.sph + lensItem.cyl) }}D
                  </td>
                </tr>
                <tr>
                  <td style="text-decoration: underline">{{ formatDegree(lensItem.cyl) }}D</td>
                  <td style="text-decoration: underline">{{ formatDegree(-lensItem.sph) }}D</td>
                </tr>
                <tr>
                  <td colspan="2"></td>
                  <td colspan="2">
                    ADD {{ formatDegree(lensItem.add) }}
                    {{ lensItem.leftOrRight ? (lensItem.leftOrRight === 1 ? 'L' : 'R') : '' }}
                  </td>
                </tr>
                <tr>
                  <td colspan="2">CT {{ lensItem.centerThickness }}mm</td>
                  <td colspan="2">Φ {{ lensItem.diameter }}mm</td>
                </tr>
                <tr>
                  <td colspan="5">工艺：</td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </div>
    </el-row>
    <template #footer>
      <el-row justify="end">
        <el-button type="primary" @click="cancel">取消</el-button>
        <el-button type="primary" @click="printTag">打印</el-button>
      </el-row>
    </template>
  </Dialog>
</template>

<style lang="scss">
.print-dialog {
  --el-dialog-bg-color: var(--app-content-bg-color);
  --el-dialog-margin-top: 20px;
}

.print-wrap {
  display: none;
  position: absolute;
}
</style>
