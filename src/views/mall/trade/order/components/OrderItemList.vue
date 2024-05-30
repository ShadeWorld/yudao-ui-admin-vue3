<script setup lang="ts">
import { OrderItem } from '@/api/mall/trade/order'
import { ElTable } from 'element-plus'
import { DegreeRange, Row } from '@/views/mall/trade/order/components/BatchSelectLens.vue'

const model = defineModel<OrderItem[]>()

// 所有行
const rows = ref<Row[]>([])

const batchSelectLensRef = ref(false)

const degreeRange = ref<DegreeRange>()

const openDetail = (item) => {
  batchSelectLensRef.value = true
}

const confirm = () => {
  let lensList = []
  rows.value.forEach((row) => {
    row.cols.forEach((col) => {
      // 找出每一行有数量的col，转换格式
      if (col.count > 0) {
        lensList.push({
          sph: row.sph,
          cyl: col.cyl,
          count: col.count,
          price: col.price,
          skuId: col.skuId
        })
      }
    })
  })
}

// TODO:要不要重新写一个BatchSelectLens专门用于详情展示，不写也可以，动态传spuId和degree-range就行，然后BatchSelectLens里面通过spuId查询sku获取价格信息
</script>

<template>
  <el-table :data="model" border class="tabNumWidth" size="small">
    <el-table-column align="center" label="商品名称" min-width="65">
      <template #default="{ row }">
        {{ row.spuName }}
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
  <ElDialog v-model="batchSelectLensRef" title="详情" width="500" destroy-on-close center>
    <BatchSelectLens :degree-range="degreeRange" v-model="rows" />
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="batchSelectLensRef = false">Cancel</el-button>
        <el-button type="primary" @click="confirm"> Confirm</el-button>
      </div>
    </template>
  </ElDialog>
</template>

<style scoped lang="scss"></style>
