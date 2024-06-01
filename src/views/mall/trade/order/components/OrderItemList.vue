<script setup lang="ts">
import { OrderItem } from '@/api/mall/trade/order'
import { ElTable } from 'element-plus'
import { Row } from '@/views/mall/trade/order/components/BatchSelectLens.vue'
import { copyValueToTarget, formatToFraction } from '@/utils'
import { BatchSelectLens } from '@/views/mall/trade/order/components'

interface TableOrderItem {
  spuId?: number
  spuName?: string
  price?: number
  count?: number
}

const model = defineModel<OrderItem[]>()

// 转换成table展示用的数据
const tableData = ref<TableOrderItem[]>([])
watch(
  () => model.value,
  (value) => {
    console.log('items变了', value)
    tableData.value = !value
      ? []
      : value?.reduce((tableData: TableOrderItem[], item: OrderItem) => {
          let data: TableOrderItem | undefined = tableData.find((i) => i.spuId === item.spuId)
          if (data) {
            data.count += item.count
          } else {
            data = {
              spuId: undefined,
              spuName: undefined,
              price: undefined,
              count: undefined
            }
            copyValueToTarget(data, item)
            tableData.push(data)
          }
          return tableData
        }, [])
  },
  { deep: true }
)

// 所有行
const rows = ref<Row[]>([])
// 详情dialog是否展示
const dialogVisible = ref(false)
// 当前详情展示spu
const detailSpu = ref<TableOrderItem>()
// Dialog宽度
const detailWidth = ref<number>(800)
/**
 * 展示已选镜片的详情
 * @param detailItem
 */
const openDetail = (detailItem) => {
  detailSpu.value = detailItem
  let minCyl = model.value[0].orderLens.cyl
  let maxCyl = minCyl
  model.value?.forEach((item: OrderItem) => {
    if (item.spuId === detailItem.spuId && item.orderLens) {
      // 生成批量选择控件的所有行
      let row = rows.value.find((i) => i.sph === item.orderLens?.sph)
      if (row) {
        row.cols.push({
          row: row,
          cyl: item.orderLens.cyl,
          add: item.orderLens.add,
          count: item.count,
          skuId: item.skuId,
          price: item.price,
          selected: false
        })
      } else {
        row = {
          sph: item.orderLens.sph,
          cols: []
        }
        row.cols.push({
          row: row,
          cyl: item.orderLens.cyl,
          add: item.orderLens.add,
          count: item.count,
          skuId: item.skuId,
          price: item.price,
          selected: false
        })
        rows.value.push(row)
      }

      // 计算最大cyl和最小cyl，用于计算dialog宽度
      minCyl = Math.min(minCyl, item.orderLens.cyl)
      maxCyl = Math.max(maxCyl, item.orderLens.cyl)
    }
  })
  detailWidth.value = ((maxCyl - minCyl) / 0.25 + 1) * 51 + 100
  dialogVisible.value = true
}
const confirm = () => {
  if (!detailSpu) return
  rows.value.forEach((row) => {
    row.cols.forEach((col) => {
      // 找出每一行有数量的col，转换格式
      if (col.skuId) {
        let orderItem = {
          spuId: detailSpu.value?.spuId,
          spuName: detailSpu.value?.spuName,
          skuId: col.skuId,
          price: col.price,
          count: col.count,
          orderLens: {
            sph: row.sph,
            cyl: col.cyl,
            add: col.add
          }
        }
        let existsItem = model.value?.find(
          (i) =>
            i.skuId == col.skuId &&
            JSON.stringify(i.orderLens) === JSON.stringify(orderItem.orderLens)
        )
        if (existsItem) {
          existsItem.count = col.count
        } else {
          model.value?.push(orderItem)
        }
      }
    })
  })
  dialogVisible.value = false
}

const onClose = () => {
  rows.value.splice(0, rows.value.length)
  detailSpu.value = undefined
}

// TODO:要不要重新写一个BatchSelectLens专门用于详情展示，不写也可以，动态传spuId和degree-range就行，然后BatchSelectLens里面通过spuId查询sku获取价格信息
</script>

<template>
  <el-table :data="tableData" border class="tabNumWidth" size="small">
    <el-table-column align="center" label="商品名称" min-width="65">
      <template #default="{ row }">
        {{ row.spuName }}
      </template>
    </el-table-column>
    <el-table-column align="center" label="单价" min-width="65">
      <template #default="{ row }">
        {{ formatToFraction(row.price) }}
      </template>
    </el-table-column>
    <el-table-column align="center" label="数量" min-width="65">
      <template #default="{ row }">
        {{ row.count }}
      </template>
    </el-table-column>
    <el-table-column align="center" label="总价" min-width="65">
      <template #default="{ row }">
        {{ formatToFraction(row.price * row.count) }}
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
  <ElDialog
    v-model="dialogVisible"
    title="详情"
    :width="detailWidth"
    destroy-on-close
    center
    @close="onClose"
  >
    <el-row justify="center">
      <BatchSelectLens v-model="rows" />
    </el-row>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirm">保存</el-button>
      </div>
    </template>
  </ElDialog>
</template>

<style scoped lang="scss"></style>
