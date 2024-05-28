<script setup lang="ts">
import { OrderItem } from '@/api/mall/trade/order'
import { ElTable } from 'element-plus'

const model = defineModel<OrderItem[]>()

console.log(model.value)
</script>

<template>
  <el-table :data="model" border class="tabNumWidth" max-height="500" size="small">
    <el-table-column align="center" label="商品名称" min-width="65">
      <template #default="{ row }"> {{ row.spuName }}</template>
    </el-table-column>
  </el-table>
</template>

<style scoped lang="scss"></style>
