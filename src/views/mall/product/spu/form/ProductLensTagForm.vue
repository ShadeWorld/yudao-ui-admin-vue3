<script setup lang="ts">
import { ElTable } from 'element-plus'
import type { LensTag, Spu } from '@/api/mall/product/spu'

const props = defineProps({
  isDetail: Boolean
})
const model = defineModel<Spu>()

const defaultRow = {
  minSph: 0,
  maxSph: 0,
  centerThickness: undefined,
  diameter: undefined
}

function addRow() {
  model.value?.lensTags?.push(JSON.parse(JSON.stringify(defaultRow)))
}

function deleteRow(row: LensTag) {
  const index = model.value!.lensTags!.findIndex(
    (lensTag) => JSON.stringify(lensTag) === JSON.stringify(row)
  )
  model.value!.lensTags!.splice(index, 1)
}

if (model.value?.lensTags?.length == 0) {
  addRow()
}
</script>

<template>
  <el-button class="mb-10px mr-15px" @click="addRow" v-if="!isDetail"> 添加</el-button>
  <el-table
    border
    class="tabNumWidth"
    max-height="500"
    size="small"
    :data="model?.lensTags"
    :fit="true"
  >
    <el-table-column align="center" label="球镜范围" min-width="128">
      <template #default="{ row }">
        <el-input-number
          v-model="row.minSph"
          :precision="2"
          :step="0.25"
          :min="-30"
          :max="30"
          class="w-45%!"
          controls-position="right"
        />
        到
        <el-input-number
          v-model="row.maxSph"
          :precision="2"
          :step="0.25"
          :min="-30"
          :max="30"
          class="w-45%!"
          controls-position="right"
        />
      </template>
    </el-table-column>
    <el-table-column align="center" label="中心厚度">
      <template #default="{ row }">
        <el-input v-model="row.centerThickness" v-if="!isDetail" />
        <span v-else>{{ row.centerThickness }}</span>
      </template>
    </el-table-column>
    <el-table-column align="center" label="直径">
      <template #default="{ row }">
        <el-input v-model="row.diameter" v-if="!isDetail" />
        <span v-else>{{ row.diameter }}</span>
      </template>
    </el-table-column>
    <el-table-column v-if="!isDetail" align="center" label="操作  ">
      <template #default="{ row }">
        <el-button link size="small" type="primary" @click="deleteRow(row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped lang="scss"></style>
