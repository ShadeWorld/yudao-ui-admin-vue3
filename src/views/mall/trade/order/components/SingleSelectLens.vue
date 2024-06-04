<script setup lang="ts">
import { Sku } from '@/api/mall/product/spu'

export interface OrderLens {
  sph: number
  cyl: number
  add: number
  leftOrRight?: number
  axis?: number
  count: number
  price: number
  skuId: number
  cylRange?: number[]
  addRange?: number[]
}

const model = defineModel<OrderLens[]>()

const props = defineProps<{
  skuList?: Sku[]
  spuId?: number
  sphRange: number[]
}>()

const addLensRow = () => {
  model.value?.push({
    sph: 0,
    cyl: 0,
    add: 0,
    count: 0,
    price: 0,
    skuId: 0
  })
}
</script>

<template>
  <div>
    <el-button type="primary" @click="addLensRow">添加</el-button>
    <el-table :data="model!" size="small" border>
      <el-table-column label="球镜">
        <template #default="{ row }">
          <el-input-number
            v-model="row.sph"
            precision="2"
            step="0.25"
            :min="sphRange[0]"
            :max="sphRange[1]"
          />
        </template>
      </el-table-column>
      <el-table-column label="柱镜">
        <template #default="{ row }">
          <el-input-number
            v-model="row.cyl"
            precision="2"
            step="0.25"
            :min="row.cylRange[0]"
            :max="row.cylRange[1]"
          />
        </template>
      </el-table-column>
      <el-table-column label="加光">
        <template #default="{ row }">
          <el-input-number
            v-model="row.add"
            precision="2"
            step="0.25"
            :min="row.addRange[0]"
            :max="row.addRange[1]"
          />
        </template>
      </el-table-column>
      <el-table-column label="左右">
        <template #default="{ row }">
          <el-select v-model="row.leftOrRight" clearable placeholder="请选择">
            <el-option value="1">左</el-option>
            <el-option value="2">右</el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="轴位">
        <template #default="{ row }">
          <el-input-number v-model="row.axis" precision="0" step="1" :min="0" :max="180" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped lang="scss"></style>
